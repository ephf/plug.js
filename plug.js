let fs = require('fs');
let AdmZip = require('adm-zip');
let rimraf = require('rimraf');
let { execSync } = require('child_process');
const deleteJava = function (directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = directoryPath + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteJava(curPath);
            } else {
                if(curPath.split('.java').length > 1) fs.unlinkSync(curPath);
            }
        });
    }
};

/**
 * @typedef java
 * @type {Object}
 * @property {int32} int 
 * @property {long} long
 * @property {double} double
 * @property {String} String 
 * @property {boolean} boolean
 * @typedef java.Array
 * @type {Object}
 * @property {int32[]} int 
 * @property {long[]} long
 * @property {double[]} double
 * @property {String[]} String
 * @property {boolean[]} boolean
 */

/**
 * @typedef Plugin
 * @type {class}
 * @param {String} name - The name of the plugin
 * @param {String} [package='com'] - The name of the sub-package
 * @param {String} [description='this plugin has no description'] - The description of the plugin
 * @param {String} [author='unknown'] - The author of the plugin
 * @param {String} [version='1.0.0'] - The version of the plugin
 * @property {String} [path='./'] - path/to/file/ -- make sure to have the '/' at the end and no spaces
 * @property {Function} addCommand - Add a command to the plugin
 *      @param {Command} command - The command you want to add to the plugin
 *      @returns {void}
 * @property {Function} Compile - Compile your code into a .jar file
 *      @returns {void}
 */

/**
 * @typedef Command
 * @type {class}
 * @param {String} name - The name of the command | /name
 * @param {String} [usage='this command doesn't specify a usage'] - The command's usage
 * @param {String} [description='this command doesn't have a description'] - The command's description
 * @param {String} [aliases=[]] - The command's aliases
 * @property {get Function} onUse - Set the function for when the command is used
 *      @param {Function} function - Function for when the command is used
 *      @returns {void}
 */

const plug = {
    Plugin: class Plugin {
        constructor(name, pkg, description, author, version) {
            this.description = description ? description : 'this plugin has no description';
            this.author = author ? author : 'unknown';
            this.version = version ? version : '1.0.0';
            this.name = name.split(' ').join('_');
            this.pkg = pkg ? pkg : 'com';
            this.commands = [];
            this.commandClass = [];
            this.path = './';
            this.java = {
                Plugin: {
                    package: `${this.pkg}.${this.name};`,
                    imports: [
                        'org.bukkit.Bukkit;',
                        'org.bukkit.plugin.java.JavaPlugin;'
                    ],
                    class: 'public class Plugin extends JavaPlugin',
                }
            }
            this.jar = new AdmZip();
            this.endComp = setInterval(() => { this.compile() }, 1);
        }

        compile() {
            this.jar.addLocalFile(`${this.path}${this.name}/plugin.yml`);
            if(this.commands) try { fs.mkdirSync(`${this.path}${this.name}/${this.pkg}/${this.name}/commands`); } catch { }
            if(!fs.existsSync(`org`) && !fs.existsSync(`${this.path}${this.name}/org`)) {
                execSync('git init', (err, a, b) => { if (err) throw err });
                execSync('git branch -M main', (err, a, b) => { if (err) throw err });
                execSync('git remote add origin https://github.com/ephf/plug-org.git', (err, a, b) => { if (err) throw err });
                execSync('git pull origin main', (err, a, b) => { if (err) throw err });
                rimraf('./.git', (err) => { if (err) throw err });
                fs.unlinkSync('README.md');
            }
            try { fs.renameSync(`org`, `${this.path}${this.name}/org`); } catch { }
            this.commands.forEach(com => {
                if(com.trigger) {
                    fs.writeFileSync(`${this.path}${this.name}/${this.pkg}/${this.name}/commands/${com.name}.java`, 
`package ${com.trigger.package}
import ${com.trigger.imports.join('\nimport ')}
${com.trigger.class} {
    ${com.trigger.new.class} {
        ${com.trigger.new.inner}
    }

    ${com.trigger.boolean.class} {
        ${com.trigger.boolean.inner}
    }
}
`);
                }
            });
            try { fs.mkdirSync(`${this.path}${this.name}/META-INF`); } catch { }

            fs.writeFileSync(`${this.path}${this.name}/META-INF/MANIFEST.MF`, 
`Manifest-Version: 1.0
Main-Class: ${this.pkg}.${this.name}.Plugin
`);
            fs.writeFileSync(`${this.path}${this.name}/${this.pkg}/${this.name}/Plugin.java`, 
`package ${this.java.Plugin.package}
import ${this.java.Plugin.imports.join('\nimport ')}
${this.java.Plugin.class} {
    @Override
    public void onEnable() {
        ${this.commands.length > 0 ? 'new ' : ''}${this.commandClass.join('(this);\nnew ')}${this.commands.length > 0 ? '(this);' : ''}
    }
}
`)
            execSync(`javac -cp ${this.path}${this.name} ${this.path}${this.name}/${this.pkg}/${this.name}/Plugin.java`);
            fs.renameSync(`${this.path}${this.name}/org`, `org`);
            deleteJava(`${this.path}${this.name}/${this.pkg}`);
            this.jar.addLocalFolder(`${this.path}${this.name}/${this.pkg}`, `${this.pkg}`);
            this.jar.addLocalFolder(`${this.path}${this.name}/META-INF`, `META-INF`);
            fs.writeFileSync(`${this.path}${this.name}.jar`, this.jar.toBuffer());
            rimraf(`${this.path}${this.name}`, (err) => { if (err) throw err });
            clearInterval(this.endComp);
        }

        addCommand(Command) {
            if(!fs.existsSync(`${this.path}${this.name}/plugin.yml`)) {
                try { fs.mkdirSync(`${this.path}${this.name}`); } catch { }
                try { fs.mkdirSync(`${this.path}${this.name}/${this.pkg}`); } catch { }
                try { fs.mkdirSync(`${this.path}${this.name}/${this.pkg}/${this.name}`); } catch { }
                fs.writeFileSync(`${this.path}${this.name}/plugin.yml`,
`name: ${this.name}
main: ${this.pkg}.${this.name}.Plugin
version: ${this.version}
author: ${this.author}
description: ${this.description}

commands:
`);
            }
            Command.trigger.package = `${this.pkg}.${this.name}.commands;`
            Command.trigger.imports.push(`${this.pkg}.${this.name}.Plugin;`)
            this.commands.push(Command);
            this.commandClass.push(Command.name);
            this.java.Plugin.imports.push(`${this.pkg}.${this.name}.commands.${Command.name};`);
            fs.writeFileSync(`${this.path}${this.name}/plugin.yml`, fs.readFileSync(`${this.path}${this.name}/plugin.yml`) + 
`   ${Command.name}:
        usage: ${Command.usage}
        description: ${Command.description}
        aliases: ${Command.aliases ? `[${Command.aliases.join(', ')}]` : '[]'}
`);
        }
    },
    Command: class Command {
        constructor(name, usage, description, aliases) {
            this.name = name;
            this.usage = usage ? usage : 'this command doesn\'t specify a usage';
            this.description = description ? description : 'this command doesn\'t have a description';
            this.aliases = aliases ? aliases : false;
        }

        set onUse(event) {
            this.trigger = {
                imports: [
                    'org.bukkit.command.Command;',
                    'org.bukkit.command.CommandExecutor;',
                    'org.bukkit.command.CommandSender;',
                    'org.bukkit.entity.Player;'
                ],
                class: `public class ${this.name} implements CommandExecutor`,
                new: {
                    class: `public ${this.name}(Plugin plugin)`,
                    inner: `plugin.getCommand("${this.name}").setExecutor(this);`
                },
                boolean: {
                    class: 'public boolean onCommand(CommandSender %sender%, Command %cmd%, String %label%, String[] %args%)',
                    inner: ''
                }
            }
            event.toString().split('\n').forEach((line, ln) => {
                if(ln == 0) {
                    let args = line.split('(')[1].split(')')[0].split(',');
                    this.trigger.boolean.class = this.trigger.boolean.class.replace('%sender%', args[0].split(' ').join(''));
                    this.sender = args[0].split(' ').join('');
                    this.trigger.boolean.class = this.trigger.boolean.class.replace('%cmd%', args[1].split(' ').join(''));
                    this.trigger.boolean.class = this.trigger.boolean.class.replace('%label%', args[2].split(' ').join(''));
                    this.trigger.boolean.class = this.trigger.boolean.class.replace('%args%', args[3].split(' ').join(''));
                }
                if(ln != 0 && ln != event.toString().split('\n').length - 1) {
                    line = line.split("'").join('"');
                    line = line.split('java.int.').join('int ');
                    line = line.split('java.long.').join('long ');
                    line = line.split('java.double.').join('double ');
                    line = line.split('java.String.').join('String ');
                    line = line.split('java.boolean.').join('boolean ');
                    line = line.split('java.Array.int.').join('int[] ');
                    line = line.split('java.Array.long.').join('long[] ');
                    line = line.split('java.Array.double.').join('double[] ');
                    line = line.split('java.Array.String.').join('String[] ');
                    line = line.split('java.Array.boolean.').join('boolean[] ');
                    line = line.split('=');
                    line.forEach((item, i) => {
                        if(i >= 1) return;
                        if(item.split('int[]').length > 1) {
                            if(line[i + 1]) {
                                let value = line[i + 1].split('[')[1].split(']')[0];
                                value = `new int[]{${value}}`;
                                line[i + 1] = value;
                            }
                        }
                        if(item.split('long[]').length > 1) {
                            if(line[i + 1]) {
                                let value = line[i + 1].split('[')[1].split(']')[0];
                                value = `new long[]{${value}}`;
                                line[i + 1] = value;
                            }
                        }
                        if(item.split('double[]').length > 1) {
                            if(line[i + 1]) {
                                let value = line[i + 1].split('[')[1].split(']')[0];
                                value = `new double[]{${value}}`;
                                line[i + 1] = value;
                            }
                        }
                        if(item.split('String[]').length > 1) {
                            if(line[i + 1]) {
                                let value = line[i + 1].split('[')[1].split(']')[0];
                                value = `new String[]{"${value}"}`;
                                line[i + 1] = value;
                            }
                        }
                        if(item.split('boolean[]').length > 1) {
                            if(line[i + 1]) {
                                let value = line[i + 1].split('[')[1].split(']')[0];
                                value = `new boolean[]{"${value}"}`;
                                line[i + 1] = value;
                            }
                        }
                        if(item.split('var').length > 1 || item.split('const').length > 1 || item.split('let').length > 1) {
                            let define = '';
                            if(item.split('var').length > 1) define = 'var';
                            if(item.split('const').length > 1) define = 'const';
                            if(item.split('let').length > 1) define = 'let';
                            if(line[i + 1]) {
                                let value = JSON.parse(line[i + 1].split(';')[0]);
                                if(typeof value == 'string') line[i] = 'String ' + line[i].split(' ').join('').split(define)[1];
                                if(typeof value == 'number') {
                                    if(Math.floor(value) != value) line[i] = 'double ' + line[i].split(' ').join('').split(define)[1]; else
                                    if(value > 127 || value < -127) line[i] = 'long ' + line[i].split(' ').join('').split(define)[1]; else
                                    line[i] = 'int ' + line[i].split(' ').join('').split(define)[1];
                                }
                                if(typeof value == 'object') {
                                    if(typeof value[0] == 'string') {
                                        line[i] = 'String[] ' + line[i].split(' ').join('').split(define)[1];
                                        line[i + 1] = `new String[]{"${value.join('", "')}"}`;
                                    }
                                    if(typeof value == 'number') {
                                        if(Math.floor(value) != value) {
                                            line[i] = 'double[] ' + line[i].split(' ').join('').split(define)[1];
                                            line[i + 1] = `new double[]{${value.join(', ')}}`;
                                        } else if(value > 127 || value < -127) {
                                            line[i] = 'long[] ' + line[i].split(' ').join('').split(define)[1];
                                            line[i + 1] = `new long[]{${value.join(', ')}}`;
                                        } else {
                                            line[i] = 'int[] ' + line[i].split(' ').join('').split(define)[1];
                                            line[i + 1] = `new int[]{${value.join(', ')}}`;
                                        }
                                    }
                                }
                                if(typeof value == 'boolean') {
                                    line[i] = 'boolean ' + line[i].split(' ').join('').split(define)[1];
                                }
                            }
                        }
                    });
                    line = line.join('=');
                    this.trigger.boolean.inner += (line.split(';').length > 1 || line.split(' ').join('').split('if')[0] == '' || line.split(' ').join('') == '}' ? line : line + ';') + '\n';
                }
            });
            this.trigger.boolean.inner += 'return true;';
        }

        set executeType(type) {
            if(type == 'player') {
                this.trigger.boolean.inner = this.trigger.boolean.inner.split(this.sender).join('player');
                this.trigger.boolean.inner = 
`Player player = (Player) ${this.sender};
if(!(player instanceof Player)) {
    ${this.sender}.sendMessage("You have to be a player in order to use this command!");
    return false;
}
` + this.trigger.boolean.inner;
            } else {
                console.warn('unknown type: ' + type);
            }
        }
    }
}

module.exports = plug;