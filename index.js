"use strict";
const path = require('path'),
	fs = require('fs');

class Package {

	static factory(name, parent) {
		var data = {};
		return new Proxy(data, new Package(name, parent, data));
	}

	constructor(name, parent, data) {
		this.name = name;
		this.parent = parent;
		this.data = data;
		this.resolved = {};
	}

	get(target, property, me) {
		console.log('get', property);
		// Don't break the repl
		if (property === 'inspect') {
			return () => this;
		}
		if (property === Symbol.toPrimitive) {
			return (hint) => this[Symbol.toPrimitive](hint);
		}
		if (this.resolved[property]) {
			return this.getProperty(property);
		}
		return this.resolve(property);
	}

	set(target, property, value, receiver) {
		// TODO: receiver check
		this.setProperty(property, value);
		return true;
	}

	setProperty(property, value) {
		this.resolved[property] = true;
		this.data[property] = value;
	}

	getProperty(property) {
		return this.data[property];
	}

	factory(property, parent) {
		return Package.factory(property, parent);
	}

	resolve(property) {
		var result = null;
		if (fs.existsSync(path.join(this.getDirectory(), property))) {
			result = this.factory(property, this);
		} else if (fs.existsSync(path.join(this.getDirectory(), property + '.js'))) {
			result = require(path.join(this.getDirectory(), property + '.js'));
		} else {
			throw new Error('Cannot find ' + property);
		}
		this.setProperty(property, result);
		return result;
	}

	has(target, property) {
		return !!this.resolved[property];
	}

	ownKeys() {
		return Object.keys(this.resolved);
	}

	[Symbol.toPrimitive](hint) {
		if (hint === 'number') {
			return Object.keys(this.data).length;
		}
		return `[object ${this.constructor.name}]`;
	}

	getDirectory() {
		return path.join(this.parent.getDirectory(), this.name);
	}
}

class Namespace extends Package {

	static get packageClass() {
		return Package;
	}

	static factory(name, directory) {
		var data = {};
		return new Proxy(data, new Namespace(name, directory, data));
	}

	constructor(name, directory, data) {
		super(name, null, data);
		this.directory = directory;
	}

	getDirectory() {
		return this.directory;
	}

}

module.exports = Namespace;