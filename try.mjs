#!/usr/bin/env node

import * as  path from 'path';

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

