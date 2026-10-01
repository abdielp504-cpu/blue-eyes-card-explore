import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  Observable,
  Subject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  merge,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Card } from '../../models/card.model';
import { YugiohService } from '../../services/yugioh.service';
import { getErrorMessage } from '../../utils/error-message';

export type CardSearchState = 'loading' | 'success' | 'empty' | 'error' | 'idle';

export interface CardSearchResult {
  query: string;
  cards: Card[];
  state: CardSearchState;
  errorMessage: string;
}

@Component({
  selector: 'app-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly stateChanged = output<CardSearchResult>();

  protected readonly searchControl = new FormControl('Blue-Eyes', { nonNullable: true });
  private readonly retryRequests = new Subject<string>();
  private searchSubscription?: Subscription;
  private readonly yugiohService = inject(YugiohService);
  private latestInputRevision = 0;
  private submittedInputRevision = 0;

  ngOnInit(): void {
    const debouncedSearches = this.searchControl.valueChanges.pipe(
      map((value) => ({ query: value.trim(), revision: ++this.latestInputRevision })),
      distinctUntilChanged((previous, current) => previous.query === current.query),
      debounceTime(400),
      filter(({ revision }) => revision > this.submittedInputRevision),
      map(({ query }) => query),
    );
    const initialSearch = of(this.searchControl.value);

    this.searchSubscription = merge(initialSearch, debouncedSearches, this.retryRequests)
      .pipe(switchMap((query) => this.search(query)))
      .subscribe((result) => this.stateChanged.emit(result));
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  protected submitSearch(): void {
    const query = this.searchControl.value.trim();
    if (query !== this.searchControl.value) {
      this.searchControl.setValue(query);
    }
    this.triggerSearch(query);
  }

  protected clearSearch(): void {
    this.searchControl.setValue('');
  }

  retry(): void {
    this.triggerSearch(this.searchControl.value.trim());
  }

  searchFor(query: string): void {
    this.searchControl.setValue(query);
    this.triggerSearch(query);
  }

  private triggerSearch(query: string): void {
    this.submittedInputRevision = this.latestInputRevision;
    this.retryRequests.next(query.trim());
  }

  private search(query: string): Observable<CardSearchResult> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return of({
        query: '',
        cards: [],
        state: 'idle',
        errorMessage: '',
      });
    }

    return this.yugiohService.searchCards(normalizedQuery).pipe(
      map((cards): CardSearchResult => ({
        query: normalizedQuery,
        cards,
        state: cards.length > 0 ? 'success' : 'empty',
        errorMessage: '',
      })),
      catchError((error: unknown) =>
        of({
          query: normalizedQuery,
          cards: [],
          state: 'error' as const,
          errorMessage: getErrorMessage(error),
        }),
      ),
      startWith({
        query: normalizedQuery,
        cards: [],
        state: 'loading' as const,
        errorMessage: '',
      }),
    );
  }
}
