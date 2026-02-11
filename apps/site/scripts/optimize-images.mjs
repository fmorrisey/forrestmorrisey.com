#!/usr/bin/env node
/**
 * Image Optimization Script
 * 
 * Optimizes images for web: resizes, compresses, and converts to WebP
 * 
 * Usage:
 *   node scripts/optimize-images.mjs [options]
 * 
 * Options:
 *   --input, -i    Input directory or file (default: public/assets/images)
 *   --output, -o   Output directory (default: same as input)
 *   --quality, -q  JPEG/WebP quality 1-100 (default: 80)
 *   --max-width    Maximum width in pixels (default: 1600)
 *   --webp         Also generate WebP versions
 *   --dry-run      Show what would be done without making changes
 *   --verbose, -v  Verbose output
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Default configuration
const CONFIG = {
  inputDir: path.join(ROOT, 'public/assets/images'),
  outputDir: null, // null = same as input
  quality: 80,
  maxWidth: 1600,
  generateWebp: false,
  dryRun: false,
  verbose: false,
  // Size thresholds (bytes)
  warnThreshold: 200 * 1024,  // 200KB
  errorThreshold: 500 * 1024, // 500KB
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...CONFIG };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        config.inputDir = path.resolve(args[++i]);
        break;
      case '--output':
      case '-o':
        config.outputDir = path.resolve(args[++i]);
        break;
      case '--quality':
      case '-q':
        config.quality = parseInt(args[++i], 10);
        break;
      case '--max-width':
        config.maxWidth = parseInt(args[++i], 10);
        break;
      case '--webp':
        config.generateWebp = true;
        break;
      case '--dry-run':
        config.dryRun = true;
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }
  
  return config;
}

function printHelp() {
  console.log(`
Image Optimization Script

Usage:
  node scripts/optimize-images.mjs [options]

Options:
  --input, -i <dir>    Input directory (default: public/assets/images)
  --output, -o <dir>   Output directory (default: same as input)
  --quality, -q <num>  JPEG/WebP quality 1-100 (default: 80)
  --max-width <num>    Maximum width in pixels (default: 1600)
  --webp               Also generate WebP versions
  --dry-run            Show what would be done without changes
  --verbose, -v        Verbose output
  --help, -h           Show this help

Examples:
  # Optimize all images in place
  node scripts/optimize-images.mjs

  # Optimize with WebP generation
  node scripts/optimize-images.mjs --webp

  # Optimize specific directory
  node scripts/optimize-images.mjs -i public/assets/images/portfolio

  # Preview changes without modifying
  node scripts/optimize-images.mjs --dry-run -v
`);
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Get all image files recursively
async function getImageFiles(dir) {
  const files = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  async function walk(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  await walk(dir);
  return files;
}

// Analyze images without sharp
async function analyzeImages(files, config) {
  const results = {
    total: files.length,
    totalSize: 0,
    oversized: [],
    byExtension: {},
  };
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      const ext = path.extname(file).toLowerCase();
      const relPath = path.relative(ROOT, file);
      
      results.totalSize += stats.size;
      results.byExtension[ext] = (results.byExtension[ext] || 0) + 1;
      
      if (stats.size > config.warnThreshold) {
        results.oversized.push({
          path: relPath,
          size: stats.size,
          level: stats.size > config.errorThreshold ? 'error' : 'warn',
        });
      }
      
      if (config.verbose) {
        const sizeStr = formatBytes(stats.size).padStart(10);
        const status = stats.size > config.errorThreshold ? '❌' :
                       stats.size > config.warnThreshold ? '⚠️ ' : '✓ ';
        console.log(`${status} ${sizeStr}  ${relPath}`);
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err.message);
    }
  }
  
  return results;
}

// Main optimization function
async function optimizeImages(files, config) {
  let sharp;
  
  try {
    sharp = (await import('sharp')).default;
  } catch (err) {
    console.error('\n❌ Sharp is not installed. Install it with:');
    console.error('   npm install sharp --save-dev\n');
    console.log('Running in analysis-only mode...\n');
    return analyzeImages(files, config);
  }
  
  const results = {
    processed: 0,
    skipped: 0,
    errors: 0,
    savedBytes: 0,
  };
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file);
      const ext = path.extname(file).toLowerCase();
      const relPath = path.relative(ROOT, file);
      
      // Skip already small files
      if (stats.size < 10 * 1024) { // < 10KB
        if (config.verbose) {
          console.log(`⏭  Skipping (already small): ${relPath}`);
        }
        results.skipped++;
        continue;
      }
      
      const image = sharp(file);
      const metadata = await image.metadata();
      
      // Determine output path
      const outputDir = config.outputDir || path.dirname(file);
      const outputPath = path.join(outputDir, path.basename(file));
      
      let pipeline = image;
      
      // Resize if too wide
      if (metadata.width > config.maxWidth) {
        pipeline = pipeline.resize(config.maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }
      
      // Apply format-specific optimization
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: config.quality, mozjpeg: true });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality: config.quality, compressionLevel: 9 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: config.quality });
      }
      
      if (config.dryRun) {
        const buffer = await pipeline.toBuffer();
        const savings = stats.size - buffer.length;
        console.log(`[DRY RUN] ${relPath}: ${formatBytes(stats.size)} → ${formatBytes(buffer.length)} (save ${formatBytes(savings)})`);
        results.savedBytes += savings;
      } else {
        // Write to temp file then rename (atomic operation)
        const tempPath = `${outputPath}.tmp`;
        await pipeline.toFile(tempPath);
        const newStats = await fs.stat(tempPath);
        
        // Only replace if smaller
        if (newStats.size < stats.size) {
          await fs.rename(tempPath, outputPath);
          const savings = stats.size - newStats.size;
          results.savedBytes += savings;
          
          if (config.verbose) {
            console.log(`✓  ${relPath}: ${formatBytes(stats.size)} → ${formatBytes(newStats.size)} (saved ${formatBytes(savings)})`);
          }
        } else {
          await fs.unlink(tempPath);
          if (config.verbose) {
            console.log(`⏭  ${relPath}: already optimized`);
          }
        }
      }
      
      // Generate WebP version
      if (config.generateWebp && ext !== '.webp') {
        const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');
        
        if (config.dryRun) {
          console.log(`[DRY RUN] Would create WebP: ${path.relative(ROOT, webpPath)}`);
        } else {
          await sharp(file)
            .resize(config.maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
            .webp({ quality: config.quality })
            .toFile(webpPath);
          
          if (config.verbose) {
            const webpStats = await fs.stat(webpPath);
            console.log(`   → WebP: ${formatBytes(webpStats.size)}`);
          }
        }
      }
      
      results.processed++;
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
      results.errors++;
    }
  }
  
  return results;
}

// Main
async function main() {
  const config = parseArgs();
  
  console.log('🖼️  Image Optimization Script\n');
  console.log(`📁 Input:     ${path.relative(ROOT, config.inputDir) || '.'}`);
  console.log(`📊 Quality:   ${config.quality}`);
  console.log(`📐 Max width: ${config.maxWidth}px`);
  if (config.generateWebp) console.log(`🌐 WebP:      enabled`);
  if (config.dryRun) console.log(`🔍 Mode:      dry-run`);
  console.log('');
  
  // Check if input exists
  try {
    await fs.access(config.inputDir);
  } catch (err) {
    console.error(`❌ Input directory does not exist: ${config.inputDir}`);
    process.exit(1);
  }
  
  // Get all image files
  const files = await getImageFiles(config.inputDir);
  
  if (files.length === 0) {
    console.log('No image files found.');
    return;
  }
  
  console.log(`Found ${files.length} image(s)\n`);
  
  // Run optimization
  const results = await optimizeImages(files, config);
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary');
  console.log('='.repeat(50));
  
  if (results.oversized) {
    // Analysis mode
    console.log(`Total files:    ${results.total}`);
    console.log(`Total size:     ${formatBytes(results.totalSize)}`);
    console.log(`\nBy extension:`);
    for (const [ext, count] of Object.entries(results.byExtension)) {
      console.log(`  ${ext}: ${count}`);
    }
    
    if (results.oversized.length > 0) {
      console.log(`\n⚠️  Oversized files (>${formatBytes(config.warnThreshold)}):`);
      results.oversized
        .sort((a, b) => b.size - a.size)
        .forEach(({ path: p, size, level }) => {
          const icon = level === 'error' ? '❌' : '⚠️ ';
          console.log(`  ${icon} ${formatBytes(size).padStart(10)}  ${p}`);
        });
    }
  } else {
    // Optimization mode
    console.log(`Processed:      ${results.processed}`);
    console.log(`Skipped:        ${results.skipped}`);
    console.log(`Errors:         ${results.errors}`);
    console.log(`Space saved:    ${formatBytes(results.savedBytes)}`);
  }
  
  console.log('');
}

main().catch(console.error);
