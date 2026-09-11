import { availableCities, availableRoles, filterContacts, groupByLetter, searchContacts } from '../utils/contactSearch';
import type { Contact } from '../services/mock/contacts';

function makeContact(overrides: Partial<Contact>): Contact {
  return {
    id: 'c1',
    name: 'Jane Doe',
    nameLower: 'jane doe',
    sortKey: 'jane doe',
    categorySlug: 'fashion',
    role: 'Stylist',
    active: true,
    ...overrides,
  };
}

const contacts: Contact[] = [
  makeContact({ id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe', role: 'Stylist', company: 'Acme', city: 'NYC' }),
  makeContact({ id: 'c2', name: 'John Smith', nameLower: 'john smith', sortKey: 'john smith', role: 'Executive', company: 'Beta Co', city: 'LA' }),
  makeContact({ id: 'c3', name: 'The Weeknd Group', nameLower: 'the weeknd group', sortKey: 'weeknd group', role: 'Management', company: 'Acme', city: 'NYC' }),
];

describe('searchContacts', () => {
  it('matches by name prefix', () => {
    expect(searchContacts(contacts, 'jan').map((c) => c.id)).toEqual(['c1']);
  });

  it('matches by company substring', () => {
    expect(searchContacts(contacts, 'acme').map((c) => c.id).sort()).toEqual(['c1', 'c3']);
  });

  it('matches by role substring', () => {
    expect(searchContacts(contacts, 'exec').map((c) => c.id)).toEqual(['c2']);
  });

  it('returns everything for an empty query', () => {
    expect(searchContacts(contacts, '')).toHaveLength(3);
  });
});

describe('filterContacts', () => {
  it('filters by role and city', () => {
    expect(filterContacts(contacts, { city: 'NYC' }).map((c) => c.id).sort()).toEqual(['c1', 'c3']);
    expect(filterContacts(contacts, { role: 'Executive' }).map((c) => c.id)).toEqual(['c2']);
  });
});

describe('availableRoles / availableCities', () => {
  it('lists distinct sorted values present in the data', () => {
    expect(availableRoles(contacts)).toEqual(['Executive', 'Management', 'Stylist']);
    expect(availableCities(contacts)).toEqual(['LA', 'NYC']);
  });
});

describe('groupByLetter', () => {
  it('groups by sortKey first letter, sorted, stripping leading articles from the key', () => {
    const groups = groupByLetter(contacts);
    const letters = groups.map((g) => g.letter);
    expect(letters).toEqual(['J', 'W']); // "The Weeknd Group" sorts under W, not T
    const jGroup = groups.find((g) => g.letter === 'J');
    expect(jGroup?.contacts.map((c) => c.id)).toEqual(['c1', 'c2']);
  });
});
