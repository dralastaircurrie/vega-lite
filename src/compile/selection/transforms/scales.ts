import {Channel} from '../../../channel';
import {warn} from '../../../log';
import {hasContinuousDomain, isBinScale} from '../../../scale';
import {stringValue} from '../../../util';
import {UnitModel} from '../../unit';
import {channelSignalName, MODIFY, TUPLE} from '../selection';
import {TransformCompiler} from './transforms';


const scaleBindings:TransformCompiler = {
  has: function(selCmpt) {
    return selCmpt.type === 'interval' && selCmpt.resolve === 'global' &&
      selCmpt.bind && selCmpt.bind === 'scales';
  },

  parse: function(model, selDef, selCmpt) {
    const bound: Channel[] = selCmpt.scales = [];

    selCmpt.project.forEach(function(p) {
      const channel = p.channel;
      const scale = model.getScaleComponent(channel);
      const scaleType = scale ? scale.get('type') : undefined;

      if (!scale || !hasContinuousDomain(scaleType) || isBinScale(scaleType)) {
        warn('Scale bindings are currently only supported for scales with unbinned, continuous domains.');
        return;
      }

      scale.set('domainRaw', {signal: channelSignalName(selCmpt, channel, 'data')}, true);
      bound.push(channel);
    });
  },

  topLevelSignals: function(model, selCmpt, signals) {
    // Top-level signals are only needed when coordinating composed views.
    if (!model.parent) {
      return signals;
    }

    const channels = selCmpt.scales.filter((channel) => {
      return !(signals.filter((s) => s.name === channelSignalName(selCmpt, channel, 'data')).length);
    });

    return signals.concat(channels.map((channel) => {
      return {name: channelSignalName(selCmpt, channel, 'data')};
    }));
  },

  signals: function(model, selCmpt, signals) {
    // Nested signals need only push to top-level signals when within composed views.
    if (model.parent) {
      selCmpt.scales.forEach(function(channel) {
        const signal = signals.filter((s) => s.name === channelSignalName(selCmpt, channel, 'data'))[0];
        signal.push = 'outer';
        delete signal.value;
        delete signal.update;
      });
    }

    return signals;
  }
};

export {scaleBindings as default};

export function domain(model: UnitModel, channel: Channel) {
  const scale = stringValue(model.scaleName(channel));
  return `domain(${scale})`;
}
