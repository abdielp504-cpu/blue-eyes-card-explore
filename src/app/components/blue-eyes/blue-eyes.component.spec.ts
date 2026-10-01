import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Card } from '../../models/card.model';
import { YugiohService } from '../../services/yugioh.service';
import { BlueEyesComponent } from './blue-eyes.component';

describe('BlueEyesComponent', () => {
  const cards: Card[] = [
    {
      id: 1,
      name: 'Blue-Eyes White Dragon',
      type: 'Normal Monster',
      desc: 'A legendary dragon.',
      race: 'Dragon',
      card_images: [],
      card_prices: [],
      card_sets: [
        {
          set_name: 'Omega Set',
          set_code: 'OMEGA-001',
          set_rarity: 'Ultra Rare',
          set_price: '12.00',
        },
        {
          set_name: 'Alpha Set',
          set_code: 'ALPHA-001',
          set_rarity: 'Common',
          set_price: '3.00',
        },
      ],
    },
    {
      id: 2,
      name: 'Blue-Eyes Alternative White Dragon',
      type: 'Effect Monster',
      desc: 'A dragon.',
      race: 'Dragon',
      card_images: [],
      card_prices: [],
      card_sets: [
        {
          set_name: 'Alpha Set',
          set_code: 'ALPHA-002',
          set_rarity: 'Super Rare',
          set_price: '5.00',
        },
      ],
    },
    {
      id: 3,
      name: 'Blue-Eyes support card',
      type: 'Spell Card',
      desc: 'A spell.',
      race: 'Normal',
      card_images: [],
      card_prices: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BlueEyesComponent],
      providers: [
        provideRouter([]),
        {
          provide: YugiohService,
          useValue: {
            getBlueEyesCards: () => of(cards),
          },
        },
      ],
    });
  });

  it('builds a unique alphabetized expansion filter and highlights matching impressions', async () => {
    const fixture = TestBed.createComponent(BlueEyesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('#collection-title')?.textContent).toContain('Blue-Eyes Collection');

    const select = page.querySelector('#expansion-select') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.textContent?.trim())).toEqual([
      'Todas',
      'Alpha Set',
      'Omega Set',
    ]);

    select.value = 'Alpha Set';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(page.querySelectorAll('app-card')).toHaveLength(2);
    const cards = page.querySelectorAll('app-card button.card-tile');
    (cards[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    const rows = page.querySelectorAll('.impressions tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('OMEGA-001');
    expect(rows[0].classList.contains('highlighted')).toBe(false);
    expect(rows[1].textContent).toContain('ALPHA-001');
    expect(rows[1].classList.contains('highlighted')).toBe(true);
  });

  it('shows a helpful message when a selected card has no set impressions', async () => {
    const fixture = TestBed.createComponent(BlueEyesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#expansion-select') as HTMLSelectElement;
    select.value = '';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll(
      'app-card button.card-tile',
    ) as NodeListOf<HTMLButtonElement>;
    cards[2].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Esta carta no tiene impresiones registradas.',
    );
    expect(fixture.nativeElement.querySelector('.impressions table')).toBeNull();
  });

  it('clears the selected card when the expansion filter changes', async () => {
    const fixture = TestBed.createComponent(BlueEyesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const select = page.querySelector('#expansion-select') as HTMLSelectElement;
    const cards = page.querySelectorAll('app-card button.card-tile');
    (cards[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(page.querySelector('.impressions')).not.toBeNull();

    select.value = 'Omega Set';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(page.querySelector('.impressions')).toBeNull();
  });
});
