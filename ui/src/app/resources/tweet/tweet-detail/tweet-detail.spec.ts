import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetDetail } from './tweet-detail';

describe('TweetDetail', () => {
  let component: TweetDetail;
  let fixture: ComponentFixture<TweetDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TweetDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TweetDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
