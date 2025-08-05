import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetList } from './tweet-list';

describe('TweetList', () => {
  let component: TweetList;
  let fixture: ComponentFixture<TweetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TweetList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TweetList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
