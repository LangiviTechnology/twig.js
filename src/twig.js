/**
 * Twig.js
 *
 * @copyright 2011-2020 John Roepke and the Twig.js Contributors
 * @license   Available under the BSD 2-Clause License
 * @link      https://github.com/twigjs/twig.js
 */

// ## twig.factory.js
//
// This file handles creating the Twig library
import core from "./twig.core.js";

import expression from "./twig.expression.js";
import functions from "./twig.functions.js";
import {TwigLib} from "./twig.lib.js";
import loaderajax from "./twig.loader.ajax.js";
import loaderfs from "./twig.loader.fs.js";
import {TwigPath} from "./twig.path.js";
import {TwigTests} from "./twig.tests.js";
import logic from "./twig.logic.js";
import async from "./twig.async.js";
import {Twig} from "./twig.exports.js";
import {TwigCompiler} from "./twig.compiler.js";
import {TwigFilters} from "./twig.filters.js";
import {TwigTemplates} from "./twig.templates.js";
import { TwigTemplate } from "./twig.template.js";
import { TwigCache } from "./twig.cache.js";

const twig = new Twig('1.14.0');

function factory(twig) {

    core(twig);
    twig.setCompile((t) => new TwigCompiler(t));
    twig.setFilterClass((t) => new TwigFilters(t));
    twig.setLibClass((t) => new TwigLib(t));
    twig.setPathClass((t) => new TwigPath(t));
    twig.setTemplateStoreClass((t) => new TwigTemplates(t));
    twig.setTestsClass((t) => new TwigTests(t));
    twig.setCacheClass((t)=>new TwigCache(t));
    functions(twig);
    expression(twig);
    logic(twig);
    async(twig);
    loaderajax(twig);
    loaderfs(twig);
    twig.Templates.registerParser('twig', params => {
        return new TwigTemplate(params);
    });

    twig.Templates.registerParser('source', params => {
        return params.data || '';
    });
}

factory(twig);

export const renderToString = function (path, options) {
    return new Promise(
        (resolve, reject) => {
            // @ts-ignore
            twig.renderFile(path, options, (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
};

export {twig};
