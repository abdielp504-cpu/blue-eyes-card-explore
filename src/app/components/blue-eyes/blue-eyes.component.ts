import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  afterNextRender,
  computed,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Card } from '../../models/card.model';
import { getErrorMessage } from '../../utils/error-message';
import { YugiohService } from '../../services/yugioh.service';
import { CardComponent } from '../card/card.component';
import { ExplorerHeroComponent } from '../explorer-hero/explorer-hero.component';

type BlueEyesState = 'loading' | 'success' | 'empty' | 'error';

@Component({
  selector: 'app-blue-eyes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ExplorerHeroComponent],
  templateUrl: './blue-eyes.component.html',
  styleUrl: './blue-eyes.component.css',
})
export class BlueEyesComponent implements OnInit, OnDestroy {
  protected readonly cards = signal<Card[]>([]);
  protected readonly expansions = computed(() => {
    const names = new Set(
      this.cards().flatMap((card) => card.card_sets?.map((set) => set.set_name) ?? []),
    );

    return [...names].sort((first, second) => first.localeCompare(second));
  });
  protected readonly selectedExpansion = signal('');
  protected readonly filteredCards = computed(() => {
    const expansion = this.selectedExpansion();
    if (!expansion) {
      return this.cards();
    }

    return this.cards().filter((card) => card.card_sets?.some((set) => set.set_name === expansion));
  });
  protected readonly selectedCard = signal<Card | null>(null);
  private readonly impressionsSection = viewChild<ElementRef<HTMLElement>>('impressions');
  private readonly injector = inject(Injector);
  protected readonly state = signal<BlueEyesState>('loading');
  protected readonly errorMessage = signal('');
  protected readonly heroImageUrl = computed(
    () => this.cards()[0]?.card_images[0]?.image_url ?? null,
  );

  private readonly yugiohService = inject(YugiohService);
  private cardsSubscription?: Subscription;

  ngOnInit(): void {
    this.loadBlueEyesCards();
  }

  ngOnDestroy(): void {
    this.cardsSubscription?.unsubscribe();
  }

  protected onCardSelected(card: Card): void {
    this.selectedCard.set(card);
    afterNextRender(
      () => {
        const section = this.impressionsSection()?.nativeElement;
        if (section && typeof section.scrollIntoView === 'function') {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      },
      { injector: this.injector },
    );
  }

  protected onExpansionChange(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedExpansion.set(event.target.value);
      this.selectedCard.set(null);
    }
  }

  protected retry(): void {
    this.loadBlueEyesCards();
  }

  private loadBlueEyesCards(): void {
    this.selectedExpansion.set('');
    this.selectedCard.set(null);
    this.state.set('loading');
    this.errorMessage.set('');
    this.cardsSubscription?.unsubscribe();
    this.loadCards(this.yugiohService.getBlueEyesCards());
  }

  private loadCards(cardsRequest: Observable<Card[]>): void {
    this.cardsSubscription = cardsRequest.subscribe({
      next: (cards) => {
        this.cards.set(cards);
        this.state.set(cards.length > 0 ? 'success' : 'empty');
      },
      error: (error: unknown) => {
        this.cards.set([]);
        const requestError =
          error instanceof HttpErrorResponse ? error : new Error('Unexpected API error');
        this.errorMessage.set(getErrorMessage(requestError));
        this.state.set('error');
      },
    });
  }
}
