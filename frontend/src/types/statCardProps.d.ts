export interface StatCardProps {
  title: string;
  value: string | number; // Value can be string (for currency) or number
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>;
  trend: string;
  change?: string; // Made optional as per error TS2741
  color: string;
}
