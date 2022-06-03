#!/usr/bin/env node

import * as  path from 'path';
import { promises as fs } from 'fs';
import * as child_process from 'child_process';

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


async function tryOption(description, option) {
    console.log(`Testing: ${description}`);

    await fs.writeFile(configJsonPath, JSON.stringify(option));

    const output = await child_process.exec(`npm run build`);
}

// Try disabling one option at a time.
for (const optionName of optionNames) {
    await tryOption(`without ${optionName}`, {
        defaults: true,
        [optionName]: false,
    })
}