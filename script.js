const terminal = document.getElementById("terminal");
let username = localStorage.getItem("username") || "guest";
function getPrompt() {
  return `Main:/Users/${username}:~$ `;
}


/* ===== Persistent storage ===== */
const defaultLinks = {
  github: "https://github.com",
  leetcode: "https://leetcode.com",
  linkedin: "https://linkedin.com"
};

let links = JSON.parse(localStorage.getItem("links")) || defaultLinks;
let commandHistory = [];
let historyIndex = -1;

/* ===== Core commands ===== */
const commands = {
  help() {
    printLine("WebHub Terminal – command reference");
    printLine("------------------------------------------------");
    printLine("about                    → about terminal");
    printLine("setname <name>           → change username");
    printLine("cls | clear              → clear screen");
    printLine("add <name> <url>         → add a website");
    printLine("modify <name> <url>      → update a website");
    printLine("remove <name>            → remove a website");
    printLine("rename <old> <new>       → rename a website");
    printLine("open <name> | go <name>  → open a website");
    printLine("ls                       → list websites");
    printLine("ls -l                    → list sites with URLs");
    printLine("------------------------------------------------");
    printLine("\n");
  },

  ls(args) {
    if (args[0] === "-l") {
      Object.entries(links).forEach(([name, url]) => {
        const div = document.createElement("div");
        const a = document.createElement("a");
        a.href = url;
        a.textContent = `${name} → ${url}`;
        a.target = "_blank";
        a.style.color = "#00ff00";
        a.style.textDecoration = "underline";
        div.appendChild(a);
        terminal.appendChild(div);
      });
      printLine("\n");
    } else {
      Object.keys(links).forEach(name => printLine(name));
      printLine("\n");
    }
  },

  add(args) {
    if (args.length < 2) {
      printLine("Usage: add <name> <url>");
      printLine("\n");
      return;
    }

    const name = args[0];
    const url = args[1];

    if (links[name]) {
      printLine(`Name already exists: ${name}`);
      printLine("\n");
      return;
    }

    if (!url.startsWith("http")) {
      printLine("Invalid URL (must start with http/https)");
      printLine("\n");
      return;
    }

    links[name] = url;
    localStorage.setItem("links", JSON.stringify(links));
    printLine(`Added '${name}' to the list`);
    printLine("\n");
  },

  modify(args) {
    if (args.length < 2) {
      printLine("Usage: modify <name> <new_url>");
      printLine("\n");
      return;
    }

    const name = args[0];
    const newUrl = args[1];

    if (!links[name]) {
      printLine(`No such entry: ${name}`);
      printLine("\n");
      return;
    }

    if (!newUrl.startsWith("http")) {
      printLine("Invalid URL (must start with http/https)");
      printLine("\n");
      return;
    }

    links[name] = newUrl;
    localStorage.setItem("links", JSON.stringify(links));
    printLine(`Updated '${name}'`);
    printLine("\n");
  },

  rename(args) {
    if (args.length < 2) {
      printLine("Usage: rename <old_name> <new_name>");
      printLine("\n");
      return;
    }

    const oldName = args[0];
    const newName = args[1];

    if (!links[oldName]) {
      printLine(`No such entry: ${oldName}`);
      printLine("\n");
      return;
    }

    if (links[newName]) {
      printLine(`Name already exists: ${newName}`);
      printLine("\n");
      return;
    }

    links[newName] = links[oldName];
    delete links[oldName];
    localStorage.setItem("links", JSON.stringify(links));
    printLine(`Renamed '${oldName}' to '${newName}'`);
    printLine("\n");
  },

  remove(args) {
    const name = args[0];
    if (!links[name]) {
      printLine(`No such entry: ${name}`);
      return;
    }

    delete links[name];
    localStorage.setItem("links", JSON.stringify(links));
    printLine(`Removed '${name}'`);
    printLine("\n");
  },

  open(args) {
    const name = args[0];
    if (!links[name]) {
      printLine(`No such site: ${name}`);
      printLine("type 'ls' to list sites");
      printLine("\n");
      return;
    }

    printLine(`Opening ${name}...`);
    printLine("\n");
    window.open(links[name], "_blank");
  },

  cls() {
    terminal.innerHTML = "";
  },

  clear() {
    terminal.innerHTML = "";
  },
  setname(args) {
    if (args.length < 1) {
      printLine("Usage: setname <username>");
      return;
    }

    const newName = args[0];

    username = newName;
    localStorage.setItem("username", username);

    printLine(`Username set to '${username}'`);
  },

  about() {
    printLine(
      `<span class="about-title">Venkie's Terminal Web Hub</span>`,
      true
    );

    printLine(
      `<span class="about-text">A persistent, customizable link hub — store websites with easy names and jump to them instantly.</span>`,
      true
    );
    printLine(
      `<span class="about-text">Type commands, open websites, and navigate your digital world faster than ever.</span>`,
      true
    );

    printLine(
      `<span class="about-divider">-----------------------------------------</span>`,
      true
    );

    printLine(
    `Built with 💜 by <a href="https://share.google/ebXaZiH1tMnnU2JT1" target="_blank" class="about-link">Venkie</a>`,
    true
  );
    printLine(
      `<span class="about-divider">-----------------------------------------</span>`,
      true
    );
    printLine("\n");
  }

};

/* ===== Terminal helpers ===== */
function printLine(text = "", isHTML = false) {
  const div = document.createElement("div");
  if (isHTML) div.innerHTML = text;
  else div.textContent = text;
  terminal.appendChild(div);
}

function newPrompt() {
  const line = document.createElement("div");

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = getPrompt();

  const input = document.createElement("input");
  input.className = "cmd-input";
  input.spellcheck = false;

  line.appendChild(prompt);
  line.appendChild(input);
  terminal.appendChild(line);
  input.focus();

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!commandHistory.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = commandHistory[historyIndex];
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!commandHistory.length) return;
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      input.value = commandHistory[historyIndex] || "";
      return;
    }

    if (e.key === "Enter") {
      const rawValue = input.value.trim();
      line.removeChild(input);
      line.appendChild(document.createTextNode(rawValue));

      commandHistory.push(rawValue);
      historyIndex = commandHistory.length;

      if (rawValue) {
        //const parts = rawValue.split(" ");
        //const cmd = parts[0].toLowerCase();
        //const args = parts.slice(1).map(a => a.toLowerCase());
        const parts = rawValue.split(" ");
        const rawCmd = parts[0].toLowerCase();
        const cmd = rawCmd === "go" ? "open" : rawCmd;
        const args = parts.slice(1).map(a => a.toLowerCase());
        if (commands[cmd]) {
          commands[cmd](args);
        } else {
          printLine(`command not found: ${parts[0]}`);
          printLine("type 'help' for a list of commands");
          printLine("\n");
        }
      }

      newPrompt();
      terminal.scrollTop = terminal.scrollHeight;
    }
  });
}

/* ===== Start ===== */
newPrompt();
