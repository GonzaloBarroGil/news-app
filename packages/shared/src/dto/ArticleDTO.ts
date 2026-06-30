// Guardian field mapping:
// id           ← id
// title        ← webTitle
// trailText    ← fields.trailText
// thumbnail    ← fields.thumbnail
// sectionName  ← sectionName
// publishedAt  ← webPublicationDate
// url          ← webUrl

export interface ArticleDTO {
  readonly id: string;
  readonly title: string;
  readonly trailText: string;
  readonly thumbnail?: string;
  readonly sectionName: string;
  readonly publishedAt: string;
  readonly url: string;
}
