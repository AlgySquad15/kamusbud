import { Component, ChangeDetectionStrategy, input, ElementRef, effect, viewChild } from '@angular/core';
import * as d3 from 'd3';
import { ChartData } from './services/gemini.service';

@Component({
  selector: 'app-chart',
  template: `<div #chartContainer class="w-full h-80"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  data = input.required<ChartData[]>();
  isDarkMode = input<boolean>(false);
  
  private chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');

  constructor() {
    effect(() => {
      const data = this.data();
      if (data && this.chartContainer()) {
        this.createChart(data);
      }
    });
  }

  private createChart(data: ChartData[]): void {
    const el = this.chartContainer().nativeElement;
    d3.select(el).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const width = el.clientWidth - margin.left - margin.right;
    const height = el.clientHeight - margin.top - margin.bottom;
    
    const svg = d3.select(el).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
        
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.label))
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height, 0]);

    const lightModeColor = "#15803d"; // green-700
    const darkModeColor = "#4ade80";  // green-400
    const axisColor = this.isDarkMode() ? "#9ca3af" : "#4b5563"; // gray-400 : gray-600

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end')
        .style('fill', axisColor);

    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', axisColor);

    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', d => x(d.label) as number)
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', this.isDarkMode() ? darkModeColor : lightModeColor)
        .attr('opacity', 0);

     svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y((d as ChartData).value))
        .attr("height", d => height - y((d as ChartData).value))
        .attr('opacity', 1)
        .delay((d,i) => i*100);
  }
}
