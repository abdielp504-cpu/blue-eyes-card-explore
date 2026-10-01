import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '../../models/card.model';
import { CardComponent } from '../card/card.component';
import { ExplorerHeroComponent } from '../explorer-hero/explorer-hero.component';
import { CardSearchResult, CardSearchState, SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ExplorerHeroComponent, SearchComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css',
})
export class SearchPageComponent {
  protected readonly cards = signal<Card[]>([]);
  protected readonly state = signal<CardSearchState>('loading');
  protected readonly searchTerm = signal('');
  protected readonly errorMessage = signal('');
  protected readonly heroImageUrl = computed(
    () => this.cards()[0]?.card_images[0]?.image_url ?? null,
  );

  private readonly searchComponent = viewChild(SearchComponent);
  private readonly router = inject(Router);

  protected onSearchStateChanged(result: CardSearchResult): void {
    this.searchTerm.set(result.query);
    this.cards.set(result.cards);
    this.errorMessage.set(result.errorMessage);
    this.state.set(result.state);
  }

  protected onCardSelected(card: Card): void {
    void this.router.navigate(['/card', card.id]);
  }

  protected retry(): void {
    this.searchComponent()?.retry();
  }

  protected showBlueEyesCards(): void {
    this.searchComponent()?.searchFor('Blue-Eyes');
  }
}
