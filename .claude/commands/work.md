Workflow:

- Select one task from @TODOS.md and implement it.
- Tasks are ordered by priority. Choose the highest priority task.
- Clarify the task requirements and obtain approval.
- After approval, assign a ticket number to the task (add prefix). Update @TODOS.md with the ticket number and improve the task title for clarity
- Create a concise PRD/TRD in the @stories folder named "<ticket-number>-<task-name>.md"
- Assess whether the task requires a test case and provide a recommendation on whether testing is necessary
- Request approval for the testing approach
- If a test case is necessary:
  - Write the test case first
  - Run the test case and verify it fails
  - Implement the code to make the test pass
- If no test case is needed:
  - Implement the code directly
- Mark the task as complete in @TODOS.md
- Request approval to commit changes with clear, descriptive commit messages
