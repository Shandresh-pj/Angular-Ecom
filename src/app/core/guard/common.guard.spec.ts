import { TestBed, async, inject } from '@angular/core/testing';

import { CommonGuard } from './common.guard';

describe('CommonGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonGuard]
    });
  });

  it('should ...', inject([CommonGuard], (guard: CommonGuard) => {
    expect(guard).toBeTruthy();
  }));
});
