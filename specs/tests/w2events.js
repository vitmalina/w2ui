// **********************************
// -- Unit Tests: w2utils

import { w2event } from '../../src/w2event.js'

QUnit.module('w2events', (mod) => {
    let event = new w2event()

    mod.beforeEach(() => {
        // Add various evenst
        event.on('custom', () => { })
        event.on('custom.scoped', () => { })
        event.on('custom:after', () => { })
        event.on('custom:before', () => { })
        event.on('custom:after.scoped', () => { })
        event.on('custom:before.scoped', () => { })
        event.on('*.scoped', () => { })
        event.on('*:after.scoped', () => { })
        event.on('*:before.scoped', () => { })
        event.on('custom.scope1', () => { })
        event.on('custom.scope2', () => { })
        event.on('custom:after.scope2', () => { })
        event.on('custom:before.scope2', () => { })
    })

    mod.afterEach(() => {
        event.off('*')
    })

    QUnit.test("Add events then remove all", (assert) => {
        assert.equal(event.handlers.length, 13, 'Events added')
        let cloned = w2utils.clone(event.handlers).map(h => { return { edata: h.edata, name: h.name }})
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
        event.off('*')
        assert.equal(event.handlers.length, 0, 'Remove all')
    });

    QUnit.test("Add events then .off('.scoped2')", (assert) => {
        event.off('.scope2')
        assert.equal(event.handlers.length, 10, 'Remove some')
    })

    QUnit.test("Add events then .off('custom')", (assert) => {
        event.off('custom')
        assert.equal(event.handlers.length, 3, 'Remove some')
    })

    QUnit.test("Add events then .off('custom:after')", (assert) => {
        event.off('custom:after')
        assert.equal(event.handlers.length, 10, 'Remove some')
    })

    QUnit.test("Add events then .off('.scope1')", (assert) => {
        event.off('.scope1')
        assert.equal(event.handlers.length, 12, 'Remove some')
    })

    QUnit.test("Add events then .off('*:after.scoped')", (assert) => {
        event.off('*:after.scoped')
        assert.equal(event.handlers.length, 11, 'Remove some')
    })

    QUnit.test("Add events then .off('*:before.scoped')", (assert) => {
        event.off('*:before.scoped')
        assert.equal(event.handlers.length, 9, 'Remove some')
    })

    QUnit.test("Add events then .off('custom:before')", (assert) => {
        event.off('custom:before')
        assert.equal(event.handlers.length, 6, 'Remove some')
    })

})