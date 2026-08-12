# forrestmorrisey.com

## Reporting into Dispatch

Dispatch tracks what blocks what across my projects. It cannot see you; it only knows what you
tell it. Use the `dispatch` MCP tools:

- **Before starting work**, `search_work_items` for it. If it is not there, `create_work_item`.
  The graph can only rank work that exists in it.
- **When you begin**, `start_job` with the `work_item_id`. Pass `parent_job_id` if you are a
  subagent, so the tree is visible rather than a flat list of strangers.
- **While working**, `heartbeat` every few minutes. Silence past `stall_after_ms` reads as a
  dead agent.
- **When you hit something you should not decide alone** — an ambiguous requirement, an
  irreversible choice, anything you would normally stop and ask about — call
  `list_decision_classes`, then `open_decision` with a concrete proposal and your honest
  confidence. This is the point of the system: the decision enters a queue ranked by how much
  work it unblocks. Then `report_blocked` and pick up something else.
- **When you notice one thing depends on another**, `propose_edge` with a verbatim quote as
  evidence. Cross-domain dependencies matter most — a research finding that gates a ticket
  exists in no other system.
- **When you finish**, `finish_job` with the artifact reference.

Do not use it as a scratchpad. `note_work_item` is for what the next agent needs to know.
