import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Card } from '../../models/card.model';
import { CardNotFoundError, YugiohService } from '../../services/yugioh.service';
import { CardDetailComponent } from '../card-detail/card-detail.component';

type CardPageState =
  { status: 'loading' } | { status: 'success'; card: Card } | { status: 'error'; message: string };

@Component({
  selector: 'app-card-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardDetailComponent, RouterLink],
  templateUrl: './card-page.component.html',
  styleUrl: './card-page.component.css',
})
export class CardPageComponent implements OnInit {
  protected readonly state = signal<CardPageState>({ status: 'loading' });

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly yugiohService = inject(YugiohService);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        switchMap((id) => {
          if (!Number.isSafeInteger(id) || id <= 0) {
            return of<CardPageState>({
              status: 'error',
              message: 'El identificador de carta no es válido.',
            });
          }

          return this.yugiohService.getCardById(id).pipe(
            map((card): CardPageState => ({ status: 'success', card })),
            catchError((error: unknown) =>
              of<CardPageState>({
                status: 'error',
                message: this.getErrorMessage(error),
              }),
            ),
            startWith<CardPageState>({ status: 'loading' }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (state) => this.state.set(state),
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof CardNotFoundError) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'No fue posible conectar con YGOPRODeck. Comprueba tu conexión e inténtalo de nuevo.';
    }

    return 'YGOPRODeck no pudo cargar esta carta. Inténtalo de nuevo.';
  }
}
