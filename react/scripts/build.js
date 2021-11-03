#! /usr/bin/env node

const path = require('path');
const fs = require('fs/promises');
const {execSync} = require('child_process');
const process = require('process');

async function copyTemplate() {
  const tmpPackageJson = await fs.readFile(path.resolve('../tmp/package.json'));

  await fs.writeFile('package.json', tmpPackageJson, 'utf-8');
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
  }Component } from 'brailor-lit-instui/dist/components/${
    elementDeclaration.tagName
  }/index';

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
  // await copyTemplate();
  execSync('npm i');
  await run();
})();
