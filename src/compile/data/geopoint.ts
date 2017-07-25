import {Field, FieldDef, isFieldDef, isProjectionFieldDef} from '../../fielddef';
import {LATITUDE, LONGITUDE} from '../../type';
import {contains, duplicate, extend, keys} from '../../util';
import {VgGeoPointTransform} from '../../vega.schema';
import {ModelWithField} from '../model';
import {UnitModel} from '../unit';
import {DataFlowNode} from './dataflow';

export interface GeoPointTransform {
  projection: string;
  fields: string[];
  as?: string[];
}

export class GeoPointNode extends DataFlowNode {
  public clone() {
    return new GeoPointNode(duplicate(this.transform));
  }

  constructor(private transform: GeoPointTransform) {
    super();
  }

  public static make(model: ModelWithField): GeoPointNode {
    const geo = model.reduceFieldDef((geoFields, def, channel) => {
      if (isProjectionFieldDef(def)) {
        geoFields[def.type] = {
          channel: channel,
          field: def.field
        };
      }
      return geoFields;
    }, {});

    if (keys(geo).length <= 0) { // lat lng not found
      return null;
    }

    const transform: GeoPointTransform = {
      projection: model.getName('projection'),
      fields: [geo[LONGITUDE].field, geo[LATITUDE].field],
      as: [geo[LONGITUDE].field + '_geo', geo[LATITUDE].field + '_geo']
    };

    return new GeoPointNode(transform);
  }

  public assemble(): VgGeoPointTransform {
    return {
      ...this.transform,
      type: 'geopoint'
    };
  }
}
