import { Readout } from '../src/models';
import { initModels } from '../src/init';
import {
  getSkippedMonthsBetweenDatesCount,
  genSkippedReadouts,
  createSkippedReadouts,
} from '../src/utils/Readouts/createSkippedReadouts';


describe('requests', () => {
  beforeAll(async () => {
    await initModels();
  });

  beforeEach(async () => {
    await Readout.sync({ force: true });
  });

  afterEach((done) => {
    done();
  });

  it('Should Create 0 skipped Readout', async () => {
    const currentDate = new Date('2010-01-02');
    const previousDate = new Date('2010-01-02');

    const params = {
      value: 5,
      date: previousDate,
    };

    const readout = await Readout.create(params);
    const skippedReadouts = await createSkippedReadouts(Readout, currentDate, readout);
    await Readout.bulkCreate(skippedReadouts);

    expect(skippedReadouts).toHaveLength(0);
  });

  it('Should Create 3 skipped Readout', async () => {
    const currentDate = new Date('2010-05-02');
    const previousDate = new Date('2010-01-02');

    const params = {
      value: 5,
      date: previousDate,
    };

    const readout = await Readout.create(params);
    const skippedReadouts = await createSkippedReadouts(Readout, currentDate, readout);
    await Readout.bulkCreate(skippedReadouts);

    expect(skippedReadouts).toHaveLength(3);
  });

  it('Should Gen 2 skipped Readout', async () => {
    const currentDate = new Date('2010-04-02');
    const previousDate = new Date('2010-01-02');

    const params = {
      value: 5,
      date: previousDate,
    };

    const readout = await Readout.create(params);
    const skippedReadouts = genSkippedReadouts(currentDate, readout);
    await Readout.bulkCreate(skippedReadouts);

    const newReadout1 = await Readout.findOne({ where: { id: 2 } });
    const newReadout2 = await Readout.findOne({ where: { id: 3 } });

    const month1 = newReadout1.getMonth();
    const month2 = newReadout2.getMonth();

    expect(month1).toEqual('February');
    expect(month2).toEqual('March');
    expect(skippedReadouts).toHaveLength(2);
  });

  it('Should Gen 0 readouts', async () => {
    const currentDate = new Date('2010-02-02');
    const previousDate = new Date('2010-02-02');

    const params = {
      value: 5,
      date: previousDate,
    };

    const readout = await Readout.create(params);
    const skippedReadouts = genSkippedReadouts(currentDate, readout);

    await Readout.bulkCreate(skippedReadouts);
    const readouts = await Readout.findAll();

    expect(skippedReadouts).toHaveLength(0);
    expect(readouts).toHaveLength(1);
  });

  it('Should be 11 skipped months', () => {
    const currentDate = new Date('2018-01-01');
    const previousDate = new Date('2017-01-01');

    const count = getSkippedMonthsBetweenDatesCount(currentDate, previousDate);
    expect(count).toEqual(11);
  });

  it('Should be 0 skipped months (no months between)', () => {
    const currentDate = new Date('2017-01-01');
    const previousDate = new Date('2017-02-01');

    const count = getSkippedMonthsBetweenDatesCount(currentDate, previousDate);
    expect(count).toEqual(0);
  });

  it('Should be 0 skipped months (current date is older)', () => {
    const currentDate = new Date('2016-01-02');
    const previousDate = new Date('2017-12-02');

    const count = getSkippedMonthsBetweenDatesCount(currentDate, previousDate);
    expect(count).toEqual(0);
  });

  it('Should be 0 skipped months (dates are same)', () => {
    const currentDate = new Date('2018-02-02');

    const count = getSkippedMonthsBetweenDatesCount(currentDate, currentDate);
    expect(count).toEqual(0);
  });
});
