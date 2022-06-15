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

const dryRun = process.argv.includes('--dry-run');
const upstreamBranch = process.argv.find(v => v.startsWith('--upstream-branch='))?.substring('--upstream-branch='.length);
const projectDir = (process.argv.find(v => v.startsWith('--project-dir='))?.substring('--project-dir='.length)) ?? '.';

if (!upstreamBranch) {
    throw new Error(`Please set the upstream branch with --upstream-branch=<branch>`)
}

if (!projectDir) {
    throw new Error(`Project directory has an invalid value (${projectDir}). Usage: --project-dir=path/to/project/dir`)
}

const configJsonPath = 'swc-compress.json';

const exec = promisify(child_process.exec);
const spawn = promisify(child_process.spawn);

async function waitExec(cmd) {

    console.log(`${dryRun ? '[DRY_RUN]' : ''} Executing ${cmd}`)

    if (!dryRun) {
        const child = await exec(cmd, {
            shell: true,
            stdio: 'inherit',
        });
    }
}

async function getCurrentBranch() {
    const { stdout, stderr } = await exec('git rev-parse --abbrev-ref HEAD');

    return stdout.trim()
}


async function tryOption(description, option) {
    console.group(`Testing: ${description}`);

    console.log(`Writing '${JSON.stringify(option)}' to ${configJsonPath}`);
    if (!dryRun) {
        await fs.writeFile(configJsonPath, JSON.stringify(option));
    }


    await waitExec(`git add -A`, {
        shell: true,
        stdio: 'inherit'
    });
    await waitExec(`git commit -m "minifier: ${description}"`, {
        shell: true,
        stdio: 'inherit'
    });
    await waitExec(`git push origin HEAD:${upstreamBranch}`, {
        shell: true,
        stdio: 'inherit'
    });
    console.groupEnd()
}

const curBranch = await getCurrentBranch();

if (curBranch === 'master' || curBranch === 'main' || curBranch === 'dev') {
    throw new Error(`Current branch is ${curBranch}. As this script creates lots of commit, it should be on a branch that is not master, main or dev.`);
}


// Try disabling one option at a time.
for (const optionName of optionNames) {
    await tryOption(`with '${optionName}: false'`, {
        defaults: true,
        [optionName]: false,
    })
}

// Try disabling two option at a time.
for (const opt1 of optionNames) {
    for (const opt2 of optionNames) {
        if (opt1 === opt2) {
            continue
        }

        await tryOption(`with '${opt1}: false, ${opt2}: false'`, {
            defaults: true,
            [opt1]: false,
            [opt2]: false,
        })
    }
}


if (dryRun) {
    await fs.unlink(configJsonPath);
}