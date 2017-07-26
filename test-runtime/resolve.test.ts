import {assert} from 'chai';
import {
  brush,
  compositeTypes,
  embedFn,
  hits as hitsMaster,
  parentSelector,
  pt,
  resolutions,
  selectionTypes,
  spec,
  testRenderFn,
  unitNames,
} from './util';

selectionTypes.forEach(function(type) {
  const embed = embedFn(browser);
  const isInterval = type === 'interval';
  const hits = isInterval ? hitsMaster.interval : hitsMaster.discrete;
  const fn = isInterval ? brush : pt;

  describe(`${type} selections at runtime`, function() {
    compositeTypes.forEach(function(specType) {
      const testRender = testRenderFn(browser, `${type}/${specType}`);
      describe(`in ${specType} views`, function() {
        // Loop through the views, click to add a selection instance.
        // Store size should stay constant, but unit names should vary.
        it('should have one global selection instance', function() {
          for (let i = 0; i < hits[specType].length; i++) {
            embed(spec(specType, i, {type, resolve: 'global'}));
            const parent = parentSelector(specType, i);
            const store = browser.execute(fn(specType, i, parent)).value;
            assert.lengthOf(store, 1);
            assert.include(store[0].unit, unitNames[specType][i]);
            testRender(`global_${i}`);

            if (i === hits[specType].length - 1) {
              const cleared = browser.execute(fn(`${specType}_clear`, 0, parent)).value;
              assert.lengthOf(cleared, 0);
              testRender(`${specType}_global_clear_${i}`);
            }
          }
        });

        resolutions.forEach(function(resolve) {
          // Loop through the views, click to add selection instance and observe
          // incrementing store size. Then, loop again but click to clear and
          // observe decrementing store size. Check unit names in each case.
          it(`should have one selection instance per ${resolve} view`, function() {
            embed(spec(specType, 0, {type, resolve}));
            for (let i = 0; i < hits[specType].length; i++) {
              const parent = parentSelector(specType, i);
              const store = browser.execute(fn(specType, i, parent)).value;
              assert.lengthOf(store, i + 1);
              assert.include(store[i].unit, unitNames[specType][i]);
              testRender(`${resolve}_${i}`);
            }

            embed(spec(specType, 1, {type, resolve}));
            for (let i = 0; i < hits[specType].length; i++) {
              const parent = parentSelector(specType, i);
              browser.execute(fn(specType, i, parent));
            }

            for (let i = hits[`${specType}_clear`].length - 1; i >= 0; i--) {
              const parent = parentSelector(specType, i);
              const store = browser.execute(fn(`${specType}_clear`, i, parent)).value;
              assert.lengthOf(store, i);
              if (i > 0) {
                assert.include(store[i - 1].unit, unitNames[specType][i - 1]);
              }
              testRender(`${resolve}_clear_${i}`);
            }
          });
        });
      });
    });
  });
});
