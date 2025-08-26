import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}

interface PieChartProps {
  data: PieChartData;
}

export default function PieChart({ data }: PieChartProps) {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as ChartOptions<'pie'>['plugins']['legend']['position'],
      },
    },
    maintainAspectRatio: false
  };

  return <Pie options={options} data={data} />;
}