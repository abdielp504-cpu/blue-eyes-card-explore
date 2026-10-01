import { TestBed } from '@angular/core/testing';
import { Card } from '../../models/card.model';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  it('renders card details and emits the selected card', async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CardComponent);
    const card: Card = {
      id: 1,
      name: 'Blue-Eyes White Dragon',
      type: 'Normal Monster',
      desc: 'A legendary dragon.',
      race: 'Dragon',
      archetype: 'Blue-Eyes',
      attribute: 'LIGHT',
      level: 8,
      atk: 3000,
      def: 2500,
      card_images: [],
      card_prices: [],
    };
    fixture.componentRef.setInput('card', card);
    fixture.detectChanges();

    const selectedCards: Card[] = [];
    fixture.componentInstance.selected.subscribe((selected) =>
      selectedCards.push(selected),
    );
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(fixture.nativeElement.textContent).toContain(card.name);
    expect(fixture.nativeElement.textContent).toContain(card.type);
    expect(fixture.nativeElement.textContent).toContain('LIGHT');
    expect(fixture.nativeElement.textContent).toContain('3000');
    expect(fixture.nativeElement.textContent).toContain('2500');
    expect(selectedCards).toEqual([card]);
  });

  it('shows placeholders when optional card fields are missing', async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CardComponent);
    fixture.componentRef.setInput('card', {
      id: 2,
      name: 'Example Spell',
      type: 'Spell Card',
      desc: 'A spell card.',
      race: 'Normal',
      card_images: [],
      card_prices: [],
    } satisfies Card);
    fixture.detectChanges();

    const stats = fixture.nativeElement.querySelector('.card-stats') as HTMLElement;
    expect(stats.querySelectorAll('b')).toHaveLength(3);
    expect(stats.textContent).toContain('—');
    expect(stats.textContent).not.toContain('ATK 0');
  });
});
