import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export function parseJsonString<T>() {
  return (source: Observable<any>): Observable<T> => {
    return source.pipe(
      map(data => {
        if (typeof data === 'string') {
          try {
            return JSON.parse(data) as T;
          } catch (e) {
            console.error('Failed to parse JSON string:', e);
            // Handle the error as you see fit. Maybe return a default value or re-throw.
            // For now, we'll let it fail to the catchError block of the subscription.
            throw new Error('Invalid JSON string received from server.');
          }
        }
        return data as T;
      })
    );
  };
}
