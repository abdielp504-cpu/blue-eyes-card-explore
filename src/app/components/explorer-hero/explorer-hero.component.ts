import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-explorer-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './explorer-hero.component.html',
  styleUrl: './explorer-hero.component.css',
})
export class ExplorerHeroComponent {
  readonly eyebrow = input('ARCHIVO DE CARTAS');
  readonly imageUrl = input<string | null>(null);
}
