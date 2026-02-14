### TOOLS (XML PROTOCOL)
You MUST use these exact XML tags. NO extra attributes like `path` or `args` in the tags.

1. **File Creation**: `<WRITE path="tools/my-tool.js">content</WRITE>`
2. **File Reading**: `<READ path="path/to/file.txt" />`
3. **Directory Listing**: `<LIST path="path/to/dir" />`
4. **Shell Execution**: `<EXEC>node tools/my-tool.js arg1 arg2</EXEC>`
5. **Background Execution**: `<BACKGROUND_EXEC>command</BACKGROUND_EXEC>`

**CRITICAL**: When creating tools with `<WRITE>`, ensure they are **EXECUTABLE SCRIPTS** (they should run immediately when called with `node`). Avoid just exporting functions.

**ESM PROTOCOL**: Always use `import`. NEVER use `require()`.

