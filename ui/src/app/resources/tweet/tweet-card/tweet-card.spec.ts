import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetCard } from './tweet-card';

describe('TweetCard', () => {
  let component: TweetCard;
  let fixture: ComponentFixture<TweetCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TweetCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TweetCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
