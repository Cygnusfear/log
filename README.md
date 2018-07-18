[![Screenshot](screenshot.png)](https://joshavanier.itch.io/log/)

**Log** is a log and time-tracker available for Linux, macOS, and Windows. Download it [here](https://joshavanier.itch.io/log).

#### Commands
| Description | Command |
| ----------- | ------- |
| Import data | `import` |
| Export data | `export` |
| Start an entry | `start "Sector" "Project" "Description"` |
| End an entry | `end` or `stop` |
| Pause a session | `pause` |
| Resume last session | `resume` or `continue` |
| Edit an entry | `edit {ID} {attribute} "Lorem ipsum"` |
| Set the interface's background colour | `bg {colour}` |
| Set the interface's text colour | `colour {colour}` |
| Set the interface's accent colour | `accent {colour}` |
| Set a sector's colour code | `cc sector "Sector Name" "{colour}"` |
| Set a project's colour code | `cc project "Project Name" "{colour}"` |
| Set colour mode | `colourmode {sector/project}` |
| Set view | `view {x}` |
| Set calendar | `calendar {desamber/monocal/gregorian}` |
| Set stat display mode | `stat {human/decimal}` |
| Set time format | `time {12/24/decimal}` |
| Rename a sector or project | `rename {sector/project} "Old Name" "New Name"` |

#### Development
```
git clone https://github.com/joshavanier/log.git
cd log
npm install
npm start
```

---

Josh Avanier

**[Twitter](https://twitter.com/joshavanier)** &middot; **[Memex](https://joshavanier.github.io)**

**MIT**
