import { TestBed } from '@angular/core/testing';

import { ConfiglangService } from './configlang.service';

describe('ConfiglangService', () => {
  let service: ConfiglangService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfiglangService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
