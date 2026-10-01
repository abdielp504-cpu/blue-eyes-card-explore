import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CardInfoResponse } from '../../models/card.model';
import { YugiohService } from '../../services/yugioh.service';
import { CardPageComponent } from './card-page.component';

describe('CardPageComponent', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '404' })),
          },
        },
        YugiohService,
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('shows a clear not-found message for an empty card response', () => {
    const fixture = TestBed.createComponent(CardPageComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.params.get('id') === '404')
      .flush({ data: [] } satisfies CardInfoResponse);
    fixture.detectChanges();

    const errorPanel = fixture.nativeElement.querySelector(
      '.status-panel[role="alert"]',
    ) as HTMLElement;
    expect(errorPanel.textContent).toContain('No se encontró una carta con ese identificador.');
  });

  it('shows the same not-found message for the API no-results 400 response', () => {
    const fixture = TestBed.createComponent(CardPageComponent);
    fixture.detectChanges();

    httpTestingController
      .expectOne((request) => request.params.get('id') === '404')
      .flush(
        { error: 'No card matching your query was found in the YGOProDeck database.' },
        { status: 400, statusText: 'Bad Request' },
      );
    fixture.detectChanges();

    const errorPanel = fixture.nativeElement.querySelector(
      '.status-panel[role="alert"]',
    ) as HTMLElement;
    expect(errorPanel.textContent).toContain('No se encontró una carta con ese identificador.');
  });
});
