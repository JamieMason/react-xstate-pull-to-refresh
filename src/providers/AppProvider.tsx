import faker from 'faker/locale/en_GB';
import React from 'react';

export interface FakeRow {
  avatar: string;
  country: string;
  name: string;
}

export type AppComponent = React.FunctionComponent<{
  doRefresh: () => Promise<void>;
  fakeRows: FakeRow[];
  msExpectedRefreshDuration: number;
  msStatusDisplay: number;
  pxDistanceRequired: number;
}>;

interface Props {
  App: AppComponent;
  msExpectedRefreshDuration: number;
  msStatusDisplay: number;
  pxDistanceRequired: number;
}

interface State {
  fakeRows: FakeRow[];
}

const sleep = (ms: number): Promise<void> =>
  new Promise(done => setTimeout(done, ms));

const loadImage = (src: string): Promise<void> =>
  new Promise(done => {
    const img = new Image();
    img.onload = () => done();
    img.src = src;
  });

const getFakeRows = (): FakeRow[] =>
  new Array(30).fill(null).map(() => {
    const country = faker.address.country();
    const name = faker.name.findName();
    return {
      avatar: `https://placeimg.com/50/50/animals?name=${name}`,
      country,
      name,
    };
  });

const throwEveryFiveSeconds = () => {
  const seconds = new Date().getSeconds();
  if (
    [0, 10, 20, 30, 40, 50]
      .map(floor => [floor, floor + 5])
      .some(([floor, ceiling]) => seconds > floor && seconds < ceiling)
  ) {
    throw new Error('Simulate Random Failures When Refreshing');
  }
};

export class AppProvider extends React.Component<Props, State> {
  state = {
    fakeRows: getFakeRows(),
  };

  doRefresh = async () => {
    const fakeRows = getFakeRows();
    const fakeDelay = sleep(this.props.msExpectedRefreshDuration).then(
      throwEveryFiveSeconds,
    );
    const loadedImages = fakeRows.map(({ avatar }) => loadImage(avatar));
    await Promise.all([fakeDelay, ...loadedImages]);
    this.setState({ fakeRows });
  };

  render() {
    const { App } = this.props;
    return (
      <App
        doRefresh={this.doRefresh}
        fakeRows={this.state.fakeRows}
        msExpectedRefreshDuration={this.props.msExpectedRefreshDuration}
        msStatusDisplay={this.props.msStatusDisplay}
        pxDistanceRequired={this.props.pxDistanceRequired}
      />
    );
  }
}
