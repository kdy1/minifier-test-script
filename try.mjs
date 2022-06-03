#!/usr/bin/env node

import * as  path from 'path';
import { promises as fs } from 'fs';
import * as child_process from 'child_process';
import { promisify } from 'util';

console.log('Testing swc minifier');

const optionNames = [
    'arrows',
    'booleans',
    'collapse_vars',
    'comparisons',
    'computed_props',
    'conditionals',
    'dead_code',
    'directives',
    'evaluate',
    'hoist_props',
    'if_return',
    'join_vars',
    'loops',
    'negate_iife',
    'properties',
    'sequences',
    'side_effects',
    'switches',
    'typeofs',
    'unused',
]

const configJsonPath = 'swc-compress.json';

const spawn = promisify(child_process.spawn);

async function tryOption(description, option) {
    console.log(`Testing: ${description}`);

    await fs.writeFile(configJsonPath, JSON.stringify(option));

    await spawn(`npm run build`, {
        shell: true,
        stdio: 'inherit'
    });
}

// Try disabling one option at a time.
for (const optionName of optionNames) {
    await tryOption(`with '${optionName}: false'`, {
        defaults: true,
        [optionName]: false,
    })
}