#! /usr/bin/env node

const path = require('path');
const fs = require('fs/promises');
const {execSync} = require('child_process');
const process = require('process');

const rootPackageJson = require('../../package.json');
const thisPackageJson = require('../build/package.json');
async function checkPackageversion() {
  if (rootPackageJson.version !== thisPackageJson.version) {
    console.warn(`
    Dependecy mismatch!
    -------------------
    Root package - ${rootPackageJson.name} and this package - ${thisPackageJson.name} versions
    are not the same!

    You should fix this!!!
    `);

    process.exit(1);
  }
  if (
    thisPackageJson.peerDependencies[rootPackageJson.name] !==
    rootPackageJson.version
  ) {
    console.warn(`
      The peerdependency version for: ${rootPackageJson.name} is not correct.
      Currently its set to: ${
        thisPackageJson.peerDependencies[rootPackageJson.name]
      },
      but it should be ${rootPackageJson.version}.
      You should fix this!!!
    `);

    process.exit(1);
  }
}
async function cleanDir() {
  const buildDir = path.resolve('build');
  await fs.rm(`${buildDir}/src`, {force: true, recursive: true});
  await fs.rm(`${buildDir}/dist`, {force: true, recursive: true});
  await fs.mkdir(`${buildDir}/src`);
  await fs.mkdir(`${buildDir}/dist`);
  process.chdir(buildDir);
}

function toPascalCase(string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      (_$1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), (s) => s.toUpperCase());
}
function getComponentEvents(declaration) {
  return (declaration.events || []).reduce((eventMap, event) => {
    return {
      ...eventMap,
      [`on${toPascalCase(event.name)}`]: event.name,
    };
  }, {});
}
async function run() {
  const elements = JSON.parse(
    await fs.readFile(path.resolve('../../custom-elements.json'), {
      encoding: 'utf-8',
    })
  );
  const index = [];

  for (let module of elements.modules) {
    for (let declaration of module.declarations) {
      if (declaration.customElement) {
        const events = getComponentEvents(declaration);
        const [componentExport] = await createComponentFile(
          declaration,
          events
        );
        index.push(componentExport);
      }
    }
  }

  // create the toc index.ts file
  await fs.writeFile('src/index.ts', index.join('\n'), 'utf-8');

  //invoke tsc
  execSync('npx tsc', {stdio: 'inherit'});
}

async function createComponentFile(elementDeclaration, events) {
  const s = `
    import React from 'react';
    import {createComponent} from '@lit-labs/react';
    import {${elementDeclaration.name} as ${
    elementDeclaration.name
  }Component } from '${rootPackageJson.name}/dist/components/${
    elementDeclaration.tagName
  }';

    export const ${elementDeclaration.name} = createComponent(
        React,
        "${elementDeclaration.tagName}",
        ${elementDeclaration.name}Component,
        ${JSON.stringify(events)}
        );`;

  fs.writeFile(`src/${elementDeclaration.name}.ts`, s, 'utf-8');

  return [
    `export {${elementDeclaration.name}} from "./${elementDeclaration.name}"`,
    s,
  ];
}

(async () => {
  await cleanDir();
  await checkPackageversion();
  execSync('npm i');
  await run();
})();
