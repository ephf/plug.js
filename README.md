# Plug.js

`mcplug.js` is a javascript package made for create Minecraft plugins. `mcplug.js` makes `.jar` files out of javascript that you can put in your plugins folder!

# Use

creating a plugin with `mcplug.js` is simple! Try following these steps:

1. Create a plugin! To create a plugin, first require the `mcplug.js` module, then assign a variable to a new `plug.Plugin`

```javascript
const plug = require('mcplug.js');

// ARGUMENTS - new plug.Plugin("name", ["package"], ["description"], ["author"], ["version"]);
var plugin = new plug.Plugin('very cool plugin', 'ephfpkg', 'this is a REALLY good plugin!', 'ephf', '1.0.0');
```

the `package`, in my case `ephfkpg`, should be something very different from other packages. If two plugins have the same package name, there code can conflict with eachother and can ruin the plugins.

2. Add a command! With this new plugin we made, we can add as many commands as we want!

```javascript
// ARGUMENTS - new plug.Command("name", ["usage"], ["description"], [aliases[]]);
var command = new plug.Command('hello', '/hello', 'say hello', ['hi']);
```

3. Add a use to the command!

```javascript
/* *this is version 1.0.0 of mcplug.js* most JavaScript functions won't work here. If you need more help, try looking up java tutorials.

use the object 'java.' if you want to create certain arguments:
eg. [ java.int | java.Array.String | java.boolean ]

The terms: const, let, and var will be changed to a certain java type as best as the code can.
eg. [ var hello = 5; === int hello = 5; ] | [ var array = ["hi", "hello", "pretty cool"]; === String[] array = new String[]{"hi","hello","pretty cool"}; ]
*/
command.onUse = function(sender, command, label, args) {
    sender.sendMessage('Hello!');
}
```

4. Add the command to the plugin!

```javascript
plugin.addCommand(command);
```

See typings in `plug.js` for more details ( I don't know if I did the typings right... )