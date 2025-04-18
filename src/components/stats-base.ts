import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';

import {StatsGraph} from '../stats.js';

/**
 * Stats type.
 *
 * To use with the {@link StatsComponent} component.
 */
export enum StatsType {
    /** Renders FPS. */
    Fps = 0,
    /** Renders frame time, **in milliseconds**. */
    Milliseconds = 1,
}

/**
 * Statistics component.
 *
 * This component will hook a container with a canvas containing
 * a graph with a FPS metric.
 *
 * ## Usage
 *
 * This component can be added anywhere in your scene, like a regular
 * Wonderland Engine component.
 */
export class StatsComponentBase extends Component {
    /** Stats type. */
    @property.enum(['fps', 'milliseconds'], 0)
    statsType: number = 0;

    /**
     * Rate, **in milliseconds**, at which the chart is updated.
     *
     * @note The value will be averaged over this time.
     */
    @property.float(500)
    updateRateMs: number = 500;

    @property.float(200)
    width: number = 200;

    @property.float(150)
    height: number = 150;

    /** Stats object. */
    stats: StatsGraph = new StatsGraph();

    /** Last computed value (FPS / ms). @hidden */
    protected _value: number = 0;

    /** Last computed text (FPS / ms). @hidden */
    protected _text: string = '';

    /** Timestamp starting at the last update. @hidden */
    private _startTime: number = 0.0;

    /** Frame count starting at the last update. @hidden */
    private _frame: number = 0;

    /* Pre/Post render hook. */

    /** Triggered after the scene is rendered. @hidden */
    private readonly _onPostRender = this._update.bind(this);

    /** @override */
    onActivate(): void {
        this.reset();
        this.engine.scene.onPostRender.add(this._onPostRender);
    }

    /** @override */
    onDeactivate(): void {
        this.engine.scene.onPostRender.remove(this._onPostRender);
    }

    start(){
        this.stats.setDimensions(this.width, this.height);
    }

    reset(): this {
        this._startTime = performance.now();
        this._frame = 0;
        return this;
    }

    @property.float(0)
    set minY(value: number) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (this.stats) this.stats.min = value;
    }

    @property.float(120)
    set maxY(value: number) {
        // @todo: Fix workaround due to how Wonderland Engine setup defaults.
        if (this.stats) this.stats.max = value;
    }

    private _update(): void {
        ++this._frame;

        const elapsedMs = performance.now() - this._startTime;
        if (elapsedMs < this.updateRateMs) return;

        switch (this.statsType) {
            case StatsType.Fps:
                this._value = this._frame / (elapsedMs * 0.001);
                this._text = `FPS: ${this._value.toFixed(1)}`;
                break;
            case StatsType.Milliseconds:
                this._value = elapsedMs / this._frame;
                this._text = `${this._value.toFixed(1)} milliseconds`;
                break;
            default:
                throw new Error(
                    `StatsComponent.update(): Unknown statsType ${this.statsType}`
                );
        }

        this.stats.update(this._value);
        this.reset();
    }
}
