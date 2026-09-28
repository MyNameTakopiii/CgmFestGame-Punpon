import rawSongs from '../../../data/songs.json';
import type { Song, SongGroup } from '../types';

export class SongRepository {
  private songs: Song[];

  constructor(initialSongs: Song[] = rawSongs as Song[]) {
    this.songs = initialSongs;
  }

  public getAll(): Song[] {
    return [...this.songs];
  }

  public getById(id: string): Song | undefined {
    return this.songs.find((s) => s.id === id);
  }

  public getByGroup(group: SongGroup): Song[] {
    return this.songs.filter((s) => s.group === group);
  }

  public getExcluded(excludeIds: Set<string>): Song[] {
    return this.songs.filter((s) => !excludeIds.has(s.id));
  }
}

export const songRepository = new SongRepository();
