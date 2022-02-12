// **********************************
// -- Unit Tests: w2utils

import { w2base } from '../../src/w2base.js'

QUnit.module('w2bases', (mod) => {
    let base = new w2base()

    mod.beforeEach(() => {
        // Add various evenst
        base.on('custom', () => { })
        base.on('custom.scoped', () => { })
        base.on('custom:after', () => { })
        base.on('custom:before', () => { })
        base.on('custom:after.scoped', () => { })
        base.on('custom:before.scoped', () => { })
        base.on('*.scoped', () => { })
        base.on('*:after.scoped', () => { })
        base.on('*:before.scoped', () => { })
        base.on('custom.scope1', () => { })
        base.on('custom.scope2', () => { })
        base.on('custom:after.scope2', () => { })
        base.on('custom:before.scope2', () => { })
    })

    mod.afterEach(() => {
        base.off('*')
    })

    QUnit.test("Add events then remove all", (assert) => {
        assert.equal(base.handlers.length, 13, 'Events added')
        let cloned = w2utils.clone(base.handlers).map(h => { return { edata: h.edata, name: h.name }})
        assert.deepEqual(cloned, [
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": undefined,
                "type": "custom"
              },
              "name": "custom"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scoped",
                "type": "custom"
              },
              "name": "custom.scoped"
            },
            {
              "edata": {
                "execute": "after",
                "onComplete": null,
                "scope": undefined,
                "type": "custom"
              },
              "name": "custom:after"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": undefined,
                "type": "custom"
              },
              "name": "custom:before"
            },
            {
              "edata": {
                "execute": "after",
                "onComplete": null,
                "scope": "scoped",
                "type": "custom"
              },
              "name": "custom:after.scoped"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scoped",
                "type": "custom"
              },
              "name": "custom:before.scoped"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scoped",
                "type": "*"
              },
              "name": "*.scoped"
            },
            {
              "edata": {
                "execute": "after",
                "onComplete": null,
                "scope": "scoped",
                "type": "*"
              },
              "name": "*:after.scoped"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scoped",
                "type": "*"
              },
              "name": "*:before.scoped"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scope1",
                "type": "custom"
              },
              "name": "custom.scope1"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scope2",
                "type": "custom"
              },
              "name": "custom.scope2"
            },
            {
              "edata": {
                "execute": "after",
                "onComplete": null,
                "scope": "scope2",
                "type": "custom"
              },
              "name": "custom:after.scope2"
            },
            {
              "edata": {
                "execute": "before",
                "onComplete": null,
                "scope": "scope2",
                "type": "custom"
              },
              "name": "custom:before.scope2"
            }
        ], 'Events processed properly')
        w2base.off('*')
        assert.equal(w2base.handlers.length, 0, 'Remove all')
    });

    QUnit.test("Add events then .off('.scoped2')", (assert) => {
        w2base.off('.scope2')
        assert.equal(w2base.handlers.length, 10, 'Remove some')
    })

    QUnit.test("Add events then .off('custom')", (assert) => {
        w2base.off('custom')
        assert.equal(w2base.handlers.length, 3, 'Remove some')
    })

    QUnit.test("Add events then .off('custom:after')", (assert) => {
        w2base.off('custom:after')
        assert.equal(w2base.handlers.length, 10, 'Remove some')
    })

    QUnit.test("Add events then .off('.scope1')", (assert) => {
        w2base.off('.scope1')
        assert.equal(w2base.handlers.length, 12, 'Remove some')
    })

    QUnit.test("Add events then .off('*:after.scoped')", (assert) => {
        w2base.off('*:after.scoped')
        assert.equal(w2base.handlers.length, 11, 'Remove some')
    })

    QUnit.test("Add events then .off('*:before.scoped')", (assert) => {
        w2base.off('*:before.scoped')
        assert.equal(w2base.handlers.length, 9, 'Remove some')
    })

    QUnit.test("Add events then .off('custom:before')", (assert) => {
        w2base.off('custom:before')
        assert.equal(w2base.handlers.length, 6, 'Remove some')
    })

})