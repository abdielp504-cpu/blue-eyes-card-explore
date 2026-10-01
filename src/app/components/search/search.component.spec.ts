import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Card, CardInfoResponse } from '../../models/card.model';
import { YugiohService } from '../../services/yugioh.service';
import { CardSearchResult, SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let httpTestingController: HttpTestingController;

  const card: Card = {
    id: 1,
    name: 'Blue-Eyes White Dragon',
    type: 'Normal Monster',
    desc: 'A legendary dragon.',
    race: 'Dragon',
    card_images: [],
    card_prices: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), YugiohService],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('waits 400 ms before searching and emits loading only when the request starts', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    const states: CardSearchResult[] = [];
    fixture.componentInstance.stateChanged.subscribe((result) => states.push(result));
    fixture.detectChanges();

    const initialRequest = httpTestingController.expectOne(
      (request) => request.params.get('fname') === 'Blue-Eyes',
    );
    expect(states.map((result) => result.state)).toEqual(['loading']);
    initialRequest.flush({ data: [card] } satisfies CardInfoResponse);
    expect(states.at(-1)?.state).toBe('success');

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Dark Magician';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 350));
    httpTestingController.expectNone((request) => request.params.get('fname') === 'Dark Magician');
    expect(states.at(-1)?.state).toBe('success');

    await new Promise((resolve) => setTimeout(resolve, 100));
    const searchRequest = httpTestingController.expectOne(
      (request) => request.params.get('fname') === 'Dark Magician',
    );
    expect(states.at(-1)?.state).toBe('loading');
    searchRequest.flush({ data: [card] } satisfies CardInfoResponse);

    expect(states.map((result) => result.state)).toEqual([
      'loading',
      'success',
      'loading',
      'success',
    ]);
  });

  it('ignores short search terms without sending a request', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    const states: CardSearchResult[] = [];
    fixture.componentInstance.stateChanged.subscribe((result) => states.push(result));
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'x';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 450));

    httpTestingController.expectNone((request) => request.params.get('fname') === 'x');
    expect(states.at(-1)?.state).toBe('idle');
    expect(states.at(-1)?.query).toBe('');
    expect(states.at(-1)?.cards).toEqual([]);
  });

  it('emits an idle state with an empty query when the input is cleared', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    const states: CardSearchResult[] = [];
    fixture.componentInstance.stateChanged.subscribe((result) => states.push(result));
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 450));

    httpTestingController.expectNone((request) => request.params.has('fname'));
    expect(states.at(-1)?.state).toBe('idle');
    expect(states.at(-1)?.query).toBe('');
  });

  it('shows an error state when the search request fails', () => {
    const fixture = TestBed.createComponent(SearchComponent);
    const states: CardSearchResult[] = [];
    fixture.componentInstance.stateChanged.subscribe((result) => states.push(result));
    fixture.detectChanges();

    const request = httpTestingController.expectOne(
      (pendingRequest) => pendingRequest.params.get('fname') === 'Blue-Eyes',
    );
    request.error(new ProgressEvent('error'));

    expect(states.at(-1)?.state).toBe('error');
    expect(states.at(-1)?.errorMessage).toContain('No fue posible conectar');
  });

  it('cancels an older in-flight search when a newer term is entered', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Dark Magician';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 450));

    const firstRequest = httpTestingController.expectOne(
      (request) => request.params.get('fname') === 'Dark Magician',
    );
    input.value = 'Blue-Eyes Alternative';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(firstRequest.cancelled).toBe(true);
    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes Alternative')
      .flush({ data: [card] } satisfies CardInfoResponse);
  });

  it('submits immediately on Enter without repeating the debounced request', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Dark Magician';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Dark Magician')
      .flush({ data: [card] } satisfies CardInfoResponse);

    await new Promise((resolve) => setTimeout(resolve, 450));
    httpTestingController.expectNone((request) => request.params.get('fname') === 'Dark Magician');
  });

  it('allows repeated programmatic searches for the same term without duplicate requests', async () => {
    const fixture = TestBed.createComponent(SearchComponent);
    fixture.detectChanges();
    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    fixture.componentInstance.searchFor('Blue-Eyes');
    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    fixture.componentInstance.searchFor('Blue-Eyes');
    httpTestingController
      .expectOne((request) => request.params.get('fname') === 'Blue-Eyes')
      .flush({ data: [card] } satisfies CardInfoResponse);

    await new Promise((resolve) => setTimeout(resolve, 450));
    httpTestingController.expectNone((request) => request.params.get('fname') === 'Blue-Eyes');
  });
});
