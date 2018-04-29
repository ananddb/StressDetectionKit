import {
  CALIBRATION_LENGTH,
  CHUNKS_REQUIRED,
  STEP_LENGTH
} from 'lib/constants';
import { calcOffsets, chunkByPattern } from 'lib/helpers';
import { ChartType, Sample } from 'lib/types';
import { action, autorun, computed, observable, runInAction } from 'mobx';
import Store from 'stores/main';

export default class Ui {
  @observable private _sliderOffset?: number;
  @observable private _selectedSample?: Sample;

  @observable currentChart: ChartType;

  constructor(private store: Store) {
    autorun(() => {
      // Reset UI state when collection stops
      if (!this.store.collecting) {
        runInAction(() => {
          this._sliderOffset = undefined;
          this._selectedSample = undefined;
          this.currentChart = 'hrv';
        });
      }
    });
  }

  @computed
  get calibrationProgress() {
    return this.store.calibrationTimePassed / CALIBRATION_LENGTH;
  }

  @computed
  get gatheredEnoughData() {
    return this.store.chunksCollected >= CHUNKS_REQUIRED;
  }

  @computed
  get dataGatheringProgress() {
    return (this.store.chunksCollected % CHUNKS_REQUIRED) / CHUNKS_REQUIRED;
  }

  // NOTE:
  // This will be re-evaluated on each sample (if it's currently used in active components of course).
  // This could get huge when there're a lot of samples collected.
  // So, if you really want to optimize it, use lazy-arrays and show only topmost entries in your views.
  @computed
  get stressSegments() {
    const chunks = chunkByPattern(this.store.currentSamples, s => s.state);
    const offsets = calcOffsets(chunks);

    return chunks.map((g, i) => {
      const from = g[0].timestamp - STEP_LENGTH;
      const to = g[g.length - 1].timestamp;
      const duration = to - from;
      const state = g[0].state;

      return { offset: offsets[i], from, to, duration, state, samples: g };
    });
  }

  @computed
  get currentSegment() {
    return this.stressSegments.find(
      s => s.offset + s.samples.length - 1 >= this.sliderOffset
    )!;
  }

  @action.bound
  moveSliderTo(offset: number) {
    this._sliderOffset =
      offset === this.store.currentSamples.length - 1 ? undefined : offset;
  }

  @computed
  get sliderOffset() {
    return this._sliderOffset !== undefined
      ? this._sliderOffset
      : this.store.currentSamples.length - 1;
  }

  @action
  selectSample(sample: Sample) {
    this._selectedSample = sample;
  }

  @computed
  get currentSample() {
    return this._sliderOffset !== undefined &&
      this._selectedSample !== undefined
      ? this._selectedSample
      : this.store.lastSample;
  }

  @action.bound
  selectChart(chart: ChartType) {
    this.currentChart = chart;
  }
}
