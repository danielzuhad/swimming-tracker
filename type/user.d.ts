import { ITrainingRecord } from "@/store/useUsersStore";

export type IUser = {
  id: string;
  name: string;
  chestStyle: number;
  freeStyle: number;
  butterflyStyle: number;
  backstrokeStyle: number;

  //   traiing result
  trainingRecords?: ITrainingRecord[];
};
