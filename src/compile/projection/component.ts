import {X, Y} from '../../channel';
import {Config} from '../../config';
import {MAIN} from '../../data';
import {Encoding} from '../../encoding';
import {Field, isProjectionFieldDef} from '../../fielddef';
import {GEOSHAPE, Mark} from '../../mark';
import {Projection, PROJECTION_PROPERTIES, ProjectionType} from '../../projection';
import {duplicate} from '../../util';
import {isVgSignalRef, VgProjection, VgSignal, VgSignalRef} from '../../vega.schema';
import {ModelWithField} from '../model';
import {Explicit, Split} from '../split';
import {UnitModel} from '../unit';

export class ProjectionComponent {
  public merged = false;

  constructor(private name: string, private size: string[], private data: string, private projection: Projection) {
  }

  public static make(model: UnitModel, projection: Projection, parentProjection?: Projection, config?: Config, mark?: Mark, encoding?: Encoding<Field>): ProjectionComponent {
    // TODO: make sure this actually works for both kinds of lookups, with GeoJSON transform, and with basic projection
    const data = model.requestDataName(MAIN);

    const width = model.getSizeSignalRef('width');
    const height = model.getSizeSignalRef('height');
    const size = [width.signal, height.signal];

    const projectionSpecified = !!projection;
    const isGeoshapeMark = mark && mark === GEOSHAPE;
    const hasEncodedProjection = encoding && [X, Y].some((channel) => isProjectionFieldDef(encoding[channel]));
    const inheritedProjection = !!parentProjection || !!(config && config.projection);

    if ((projectionSpecified) || (inheritedProjection && (isGeoshapeMark || hasEncodedProjection))) {
      return new ProjectionComponent(model.getName('projection'), size, data, {
        ...config && config.projection ? config.projection : {},
        ...(projection || parentProjection || {}),
      } as Projection);
    }
    return undefined;
  }

  public merge(other: ProjectionComponent) {
    // TODO merge
    // this.merged = true;
    // other.merged = false;
  }

  public assemble(): VgProjection {
    return {
      name: this.name,
      fit: {
        signal: `data('${this.data}')`
      },
      size: {
        signal: `'${[this.size.toString()]}'`
      },
      ...this.projection
    };
  }
}
