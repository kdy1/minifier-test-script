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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const dryRun = process.argv.includes('--dry-run');
const upstreamBranch = process.argv.find(v => v.startsWith('--upstream-branch='))?.substring('--upstream-branch='.length);
const projectDirs = process.argv.filter(v => v.startsWith('--dir=')).map(s => s.substring('--dir='.length));
if (projectDirs.length === 0) {
    projectDirs.push('.')
}

if (!upstreamBranch) {
    throw new Error(`Please set the upstream branch with --upstream-branch=<branch>`)
}

const configJsonPath = (projectDir) => `${projectDir}/swc-compress.json`;

const exec = promisify(child_process.exec);
const spawn = promisify(child_process.spawn);

async function waitExec(cmd) {

    console.log(`${dryRun ? '[DRY_RUN]' : ''} Executing ${cmd}`)

    if (!dryRun) {
        const { stdout, stderr } = await exec(cmd, {
            shell: true,
            stdio: 'inherit',
        });
    }
}

async function getCurrentBranch() {
    const { stdout, stderr } = await exec('git rev-parse --abbrev-ref HEAD');

    return stdout.trim()
}


async function tryOption(gitSuffix, description, option) {
    console.group(`Testing: ${description}`);

    for (const projectDir of projectDirs) {
        console.log(`Writing '${JSON.stringify(option)}' to ${configJsonPath(projectDir)}`);
        if (!dryRun) {
            fs.mkdir(projectDir, { recursive: true });
            await fs.writeFile(configJsonPath(projectDir), JSON.stringify(option));
        }
    }


    await waitExec(`git add -A`, {
        shell: true,
        stdio: 'inherit'
    });
    await waitExec(`git commit --no-verify -m "minifier: ${description}"`, {
        shell: true,
        stdio: 'inherit'
    });
    await waitExec(`git push --no-verify origin HEAD:${upstreamBranch}-${gitSuffix}`, {
        shell: true,
        stdio: 'inherit'
    });
    if (!dryRun) {
        console.log(`Sleeping for 10 seconds to ensure vercel builds the current commit`)
        await sleep(10000);
    }
    console.groupEnd()
}

const curBranch = await getCurrentBranch();

if (curBranch === 'master' || curBranch === 'main' || curBranch === 'dev') {
    throw new Error(`Current branch is ${curBranch}. As this script creates lots of commit, it should be on a branch that is not master, main or dev.`);
}

// Try disabling one option at a time.
for (const optionName of optionNames) {
    await tryOption(`1-${optionName}`, `with '${optionName}: false'`, {
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

        await tryOption(`2-${opt1}-${opt2}`, `with '${opt1}: false, ${opt2}: false'`, {
            defaults: true,
            [opt1]: false,
            [opt2]: false,
        })
    }
}


for (const projectDir of projectDirs) {
    if (!dryRun) {
        await fs.unlink(configJsonPath(projectDir));
    }
}