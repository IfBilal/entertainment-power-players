import { render, screen } from '@testing-library/react-native';
import { AppText, Button, Card, EmptyState } from '../components';

describe('shared primitives', () => {
  it('renders AppText with the given text', async () => {
    await render(<AppText>Hello</AppText>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders a Button label', async () => {
    await render(<Button label="Continue" onPress={() => undefined} />);
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('renders Card children', async () => {
    await render(
      <Card>
        <AppText>Inside card</AppText>
      </Card>,
    );
    expect(screen.getByText('Inside card')).toBeTruthy();
  });

  it('renders EmptyState title and description', async () => {
    await render(<EmptyState icon="search-outline" title="Nothing here" description="Try again" />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
