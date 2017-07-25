import {VgProjection} from '../../vega.schema';
import {FacetModel} from '../facet';
import {Model} from '../model';
import {UnitModel} from '../unit';

export function assembleProjections(model: Model): VgProjection[] {
  if (model instanceof UnitModel || model instanceof FacetModel) {
    return [assembleProjection(model)];
  } else {
    return model.children.reduce((projections, child) => {
      return projections.concat(child.assembleProjections());
    }, [assembleProjection(model)]);
  }
}

export function assembleProjection(model: Model): VgProjection {
  return {
    name: null
  };
}
