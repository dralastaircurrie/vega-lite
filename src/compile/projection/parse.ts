import {VgProjection} from '../../vega.schema';
import {ProjectionNode} from '../data/projection';
import {Model} from '../model';
import {UnitModel} from '../unit';

export function parseProjection(model: Model) {
  if (model instanceof UnitModel) {
    model.component.projections = [ProjectionNode.make(model)];
  } else {
    model.component.projections = parseNonUnitProjections(model);
  }
}

function parseUnitProjection(model: UnitModel): VgProjection {
  return {
    name: null
  };
}

function parseNonUnitProjections(model: Model): VgProjection[] {
  return [{
    name: null
  }];
}
