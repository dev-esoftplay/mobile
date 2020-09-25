# Esoftplay Mobile Framework
simplify the way to create react-native project from scratch

* **[How to install](#how-to-install)**
* **[How to use](#how-to-use)**
* **[Create new module](#create-new-module)**
* **[Module styling](#module-styling)**
* **[Contact us](#contact-us)**

## How to install

All you need to do is installing esoftplay package after you create new project, or use following example commands:
* ``expo init myApp``
* ``cd myApp``
* ``npm install esoftplay``

and now you have new command-line called `esp` which is only work when you call it in terminal inside the project

## How to use

After installing esoftplay package, now you can edit `app.json` based on your needs and use this package's `app.json` as your reference, and don't forget that you now have new command-line call `esp`. We have provided more information about how to use that command-line by typing `esp help` inside the project.

## Create new module

Type `esp new modulename/taskname` in terminal inside your project if you want to use redux, or `esp create modulename/taskname` to create a new script without redux

Once new module is created, now you can use your new module in other modules by using `esp.mod('modulename/taskname')` or jump to that module by `this.props.navigation.navigate('modulename/taskname', {id: 1, name: "John Doe"})`

## Module styling

All modules in your new project are replacable, so you can create new module in one project and reuse the script in other projects without making any changes in your old module. So when you need to improve your script only for one particular project, you just simply extend the module using command-line `esp create modulename/taskname`

In case you have made very complex module in project A, you can safely put new style in project B without changing any line in project A (You can use softlink from project A's module to project B before using command `esp create modulename/taskname`)

## Contact us

Please open issues for any bugs that you encounter. You can reach out to us on [esoftplay.com](http://esoftplay.com) or, write to mobile@fisip.net for any questions that you might have.
