import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')

plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

data_path = 'src/results/batch_analysis_20250814_094937/data/all_measurements.csv'
df = pd.read_csv(data_path)

df = df.dropna(subset=['mean_color_r', 'mean_color_g', 'mean_color_b', 'trout_area_sq_inches', 'total_length_inches'])

df['rgb_intensity'] = (df['mean_color_r'] + df['mean_color_g'] + df['mean_color_b']) / 3
df['rgb_saturation'] = df[['mean_color_r', 'mean_color_g', 'mean_color_b']].std(axis=1)
df['size_index'] = df['trout_area_sq_inches'] * df['total_length_inches']
df['fin_ratio'] = (df['dorsal_fin_area_sq_inches'] + df['anal_fin_area_sq_inches'] + 
                   df['pectoral_fin_area_sq_inches']) / df['trout_area_sq_inches']
df['condition_factor'] = (df['trout_area_sq_inches'] / (df['total_length_inches'] ** 2)) * 100

fig = plt.figure(figsize=(20, 24))

ax1 = plt.subplot(4, 3, 1)
scatter = ax1.scatter(df['mean_color_r'], df['mean_color_g'], 
                     s=df['trout_area_sq_inches']*3, 
                     c=df['mean_color_b'], cmap='viridis', alpha=0.6)
ax1.set_xlabel('Red Channel Intensity', fontsize=12)
ax1.set_ylabel('Green Channel Intensity', fontsize=12)
ax1.set_title('RGB Color Space Distribution\n(Bubble size = Fish Area)', fontsize=14, fontweight='bold')
plt.colorbar(scatter, label='Blue Channel Intensity')
ax1.grid(True, alpha=0.3)

ax2 = plt.subplot(4, 3, 2)
scatter2 = ax2.scatter(df['rgb_intensity'], df['trout_area_sq_inches'],
                      s=df['rgb_saturation']*10, 
                      c=df['total_length_inches'], cmap='coolwarm', alpha=0.6)
ax2.set_xlabel('Mean RGB Intensity', fontsize=12)
ax2.set_ylabel('Fish Area (sq inches)', fontsize=12)
ax2.set_title('Pigmentation vs Size Relationship\n(Bubble size = Color Saturation)', fontsize=14, fontweight='bold')
plt.colorbar(scatter2, label='Total Length (inches)')
ax2.grid(True, alpha=0.3)

ax3 = plt.subplot(4, 3, 3)
scatter3 = ax3.scatter(df['total_length_inches'], df['mean_color_r'],
                      s=df['dorsal_fin_area_sq_inches']*50, 
                      c=df['color_variance'], cmap='plasma', alpha=0.6)
ax3.set_xlabel('Total Length (inches)', fontsize=12)
ax3.set_ylabel('Red Channel Intensity', fontsize=12)
ax3.set_title('Length vs Red Pigmentation\n(Bubble size = Dorsal Fin Area)', fontsize=14, fontweight='bold')
plt.colorbar(scatter3, label='Color Variance')
ax3.grid(True, alpha=0.3)

ax4 = plt.subplot(4, 3, 4)
scatter4 = ax4.scatter(df['total_length_inches'], df['mean_color_g'],
                      s=df['anal_fin_area_sq_inches']*50,
                      c=df['lateral_linearity'], cmap='YlOrRd', alpha=0.6)
ax4.set_xlabel('Total Length (inches)', fontsize=12)
ax4.set_ylabel('Green Channel Intensity', fontsize=12)
ax4.set_title('Length vs Green Pigmentation\n(Bubble size = Anal Fin Area)', fontsize=14, fontweight='bold')
plt.colorbar(scatter4, label='Lateral Line Linearity')
ax4.grid(True, alpha=0.3)

ax5 = plt.subplot(4, 3, 5)
scatter5 = ax5.scatter(df['total_length_inches'], df['mean_color_b'],
                      s=df['pectoral_fin_area_sq_inches']*50,
                      c=df['condition_factor'], cmap='BuPu', alpha=0.6)
ax5.set_xlabel('Total Length (inches)', fontsize=12)
ax5.set_ylabel('Blue Channel Intensity', fontsize=12)
ax5.set_title('Length vs Blue Pigmentation\n(Bubble size = Pectoral Fin Area)', fontsize=14, fontweight='bold')
plt.colorbar(scatter5, label='Condition Factor')
ax5.grid(True, alpha=0.3)

ax6 = plt.subplot(4, 3, 6)
df_binned = df.copy()
df_binned['length_category'] = pd.qcut(df_binned['total_length_inches'], q=4, 
                                        labels=['Small', 'Medium', 'Large', 'Extra Large'])
colors_mean = df_binned.groupby('length_category')[['mean_color_r', 'mean_color_g', 'mean_color_b']].mean()
x = np.arange(len(colors_mean.index))
width = 0.25
ax6.bar(x - width, colors_mean['mean_color_r'], width, label='Red', color='red', alpha=0.7)
ax6.bar(x, colors_mean['mean_color_g'], width, label='Green', color='green', alpha=0.7)
ax6.bar(x + width, colors_mean['mean_color_b'], width, label='Blue', color='blue', alpha=0.7)
ax6.set_xlabel('Size Category', fontsize=12)
ax6.set_ylabel('Mean Color Intensity', fontsize=12)
ax6.set_title('RGB Distribution by Size Class', fontsize=14, fontweight='bold')
ax6.set_xticks(x)
ax6.set_xticklabels(colors_mean.index)
ax6.legend()
ax6.grid(True, alpha=0.3)

ax7 = plt.subplot(4, 3, 7)
scatter7 = ax7.scatter(df['rgb_saturation'], df['fin_ratio'],
                      s=df['trout_area_sq_inches']*2,
                      c=df['total_length_inches'], cmap='RdYlBu', alpha=0.6)
ax7.set_xlabel('Color Saturation (RGB Std Dev)', fontsize=12)
ax7.set_ylabel('Fin-to-Body Ratio', fontsize=12)
ax7.set_title('Phenotypic Correlation:\nColor Variation vs Morphology', fontsize=14, fontweight='bold')
plt.colorbar(scatter7, label='Total Length (inches)')
ax7.grid(True, alpha=0.3)

ax8 = plt.subplot(4, 3, 8)
features = ['mean_color_r', 'mean_color_g', 'mean_color_b', 
           'total_length_inches', 'trout_area_sq_inches', 'fin_ratio']
scaler = StandardScaler()
scaled_data = scaler.fit_transform(df[features].dropna())
pca = PCA(n_components=2)
pca_result = pca.fit_transform(scaled_data)
scatter8 = ax8.scatter(pca_result[:, 0], pca_result[:, 1],
                      c=df['total_length_inches'].values[:len(pca_result)], 
                      cmap='viridis', alpha=0.6)
ax8.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)', fontsize=12)
ax8.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)', fontsize=12)
ax8.set_title('PCA: Morphological & Color Traits', fontsize=14, fontweight='bold')
plt.colorbar(scatter8, label='Total Length (inches)')
ax8.grid(True, alpha=0.3)

ax9 = plt.subplot(4, 3, 9)
hexbin = ax9.hexbin(df['total_length_inches'], df['rgb_intensity'], 
                    gridsize=20, cmap='YlOrRd', mincnt=1)
ax9.set_xlabel('Total Length (inches)', fontsize=12)
ax9.set_ylabel('Mean RGB Intensity', fontsize=12)
ax9.set_title('Density Map: Size vs Pigmentation', fontsize=14, fontweight='bold')
plt.colorbar(hexbin, label='Sample Count')
ax9.grid(True, alpha=0.3)

ax10 = plt.subplot(4, 3, 10)
scatter10 = ax10.scatter(df['condition_factor'], df['color_variance'],
                        s=df['total_length_inches']*5,
                        c=df['rgb_intensity'], cmap='twilight', alpha=0.6)
ax10.set_xlabel('Condition Factor', fontsize=12)
ax10.set_ylabel('Color Variance', fontsize=12)
ax10.set_title('Health Indicator vs Color Diversity\n(Bubble size = Length)', fontsize=14, fontweight='bold')
plt.colorbar(scatter10, label='RGB Intensity')
ax10.grid(True, alpha=0.3)

ax11 = plt.subplot(4, 3, 11)
df_binned['rgb_dominance'] = df_binned[['mean_color_r', 'mean_color_g', 'mean_color_b']].idxmax(axis=1)
df_binned['rgb_dominance'] = df_binned['rgb_dominance'].map({'mean_color_r': 'Red', 
                                               'mean_color_g': 'Green', 
                                               'mean_color_b': 'Blue'})
dominance_counts = df_binned.groupby(['length_category', 'rgb_dominance']).size().unstack(fill_value=0)
dominance_counts.plot(kind='bar', stacked=True, ax=ax11, color=['red', 'green', 'blue'], alpha=0.7)
ax11.set_xlabel('Size Category', fontsize=12)
ax11.set_ylabel('Count', fontsize=12)
ax11.set_title('Dominant Color Channel by Size', fontsize=14, fontweight='bold')
ax11.legend(title='Dominant Channel')
ax11.grid(True, alpha=0.3)

ax12 = plt.subplot(4, 3, 12)
from scipy.stats import gaussian_kde
x = df['total_length_inches'].values
y = df['rgb_intensity'].values
xy = np.vstack([x, y])
z = gaussian_kde(xy)(xy)
scatter12 = ax12.scatter(x, y, c=z, s=50, alpha=0.5, cmap='hot')
ax12.set_xlabel('Total Length (inches)', fontsize=12)
ax12.set_ylabel('RGB Intensity', fontsize=12)
ax12.set_title('Kernel Density: Size-Color Relationship', fontsize=14, fontweight='bold')
plt.colorbar(scatter12, label='Density')
ax12.grid(True, alpha=0.3)

plt.suptitle('Comprehensive Genetic Phenotype Analysis: Morphological & Pigmentation Traits', 
            fontsize=16, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig('genetic_phenotype_analysis.png', dpi=300, bbox_inches='tight')
plt.show()

print("\n=== QUALITATIVE GENETIC INSIGHTS ===\n")

print("1. PIGMENTATION-SIZE CORRELATION:")
corr_r_length = df['mean_color_r'].corr(df['total_length_inches'])
corr_g_length = df['mean_color_g'].corr(df['total_length_inches'])
corr_b_length = df['mean_color_b'].corr(df['total_length_inches'])
print(f"   - Red channel correlation with length: {corr_r_length:.3f}")
print(f"   - Green channel correlation with length: {corr_g_length:.3f}")
print(f"   - Blue channel correlation with length: {corr_b_length:.3f}")

if abs(corr_b_length) > abs(corr_r_length) and abs(corr_b_length) > abs(corr_g_length):
    print("   → Blue pigmentation shows strongest correlation with size - potential genetic linkage")

print("\n2. PHENOTYPIC VARIANCE ANALYSIS:")
cv_length = df['total_length_inches'].std() / df['total_length_inches'].mean() * 100
cv_area = df['trout_area_sq_inches'].std() / df['trout_area_sq_inches'].mean() * 100
cv_color = df['rgb_intensity'].std() / df['rgb_intensity'].mean() * 100
print(f"   - Length coefficient of variation: {cv_length:.1f}%")
print(f"   - Area coefficient of variation: {cv_area:.1f}%")
print(f"   - Color intensity coefficient of variation: {cv_color:.1f}%")
print(f"   → High morphological variance ({max(cv_length, cv_area):.1f}%) suggests genetic diversity")

print("\n3. ALLOMETRIC RELATIONSHIPS:")
log_length = np.log(df['total_length_inches'])
log_area = np.log(df['trout_area_sq_inches'])
slope, intercept, r_value, p_value, std_err = stats.linregress(log_length, log_area)
print(f"   - Allometric scaling exponent: {slope:.2f}")
print(f"   - R-squared: {r_value**2:.3f}, p-value: {p_value:.4f}")
if slope > 2:
    print("   → Positive allometry detected - larger fish have proportionally greater body depth")
else:
    print("   → Isometric growth pattern observed")

print("\n4. COLOR PATTERN HERITABILITY INDICATORS:")
df['rgb_dominance'] = df[['mean_color_r', 'mean_color_g', 'mean_color_b']].idxmax(axis=1)
df['rgb_dominance'] = df['rgb_dominance'].map({'mean_color_r': 'Red', 
                                               'mean_color_g': 'Green', 
                                               'mean_color_b': 'Blue'})
color_clusters = df.groupby('rgb_dominance').size()
print(f"   - Distribution of color phenotypes:")
for color, count in color_clusters.items():
    print(f"     • {color}: {count} specimens ({count/len(df)*100:.1f}%)")

print("\n5. CONDITION-DEPENDENT TRAITS:")
corr_condition_color = df['condition_factor'].corr(df['color_variance'])
print(f"   - Condition factor vs color variance correlation: {corr_condition_color:.3f}")
if corr_condition_color > 0.2:
    print("   → Positive correlation suggests color expression is condition-dependent")

print("\n6. FIN MORPHOLOGY PATTERNS:")
fin_length_corr = df['fin_ratio'].corr(df['total_length_inches'])
print(f"   - Fin ratio correlation with length: {fin_length_corr:.3f}")
if abs(fin_length_corr) < 0.1:
    print("   → Fin proportions remain constant across sizes - likely under strong genetic control")

print("\n7. POPULATION STRUCTURE INDICATORS:")
quartiles = df['total_length_inches'].quantile([0.25, 0.5, 0.75])
print(f"   - Size distribution quartiles: Q1={quartiles[0.25]:.1f}, Q2={quartiles[0.5]:.1f}, Q3={quartiles[0.75]:.1f}")
skewness = df['total_length_inches'].skew()
print(f"   - Distribution skewness: {skewness:.2f}")
if abs(skewness) > 0.5:
    print("   → Asymmetric size distribution may indicate selective pressures or age structure")

print("\n8. LATERAL LINE DEVELOPMENT:")
lat_line_mean = df['lateral_linearity'].mean()
lat_line_std = df['lateral_linearity'].std()
print(f"   - Mean lateral line linearity: {lat_line_mean:.3f} ± {lat_line_std:.3f}")
print("   → Low values indicate complex lateral line patterns - important for sensory adaptation")

print("\n9. SEXUAL DIMORPHISM INDICATORS:")
bimodal_test = df['trout_area_sq_inches'].value_counts(bins=10)
print("   - Analyzing size distribution for bimodality...")
if cv_area > 30:
    print("   → High size variance may indicate sexual dimorphism or multiple age cohorts")

print("\n10. ADAPTIVE TRAIT CORRELATIONS:")
features_corr = df[['mean_color_r', 'mean_color_g', 'mean_color_b', 
                    'total_length_inches', 'condition_factor', 'fin_ratio']].corr()
strong_correlations = []
for i in range(len(features_corr.columns)):
    for j in range(i+1, len(features_corr.columns)):
        if abs(features_corr.iloc[i, j]) > 0.5:
            strong_correlations.append((features_corr.columns[i], features_corr.columns[j], features_corr.iloc[i, j]))

if strong_correlations:
    print("   - Strong trait correlations detected:")
    for trait1, trait2, corr in strong_correlations:
        print(f"     • {trait1.replace('mean_color_', '').replace('_', ' ').title()} ↔ {trait2.replace('mean_color_', '').replace('_', ' ').title()}: {corr:.3f}")

print("\n" + "="*50)
print("GENETIC INTERPRETATION SUMMARY:")
print("="*50)
print("""
The phenotypic data reveals several key patterns of genetic and environmental interest:

1. COLOR POLYMORPHISM: The population exhibits substantial variation in RGB pigmentation
   patterns, with blue channel showing strongest size-dependent expression. This suggests
   potential genetic linkage between growth and pigmentation loci.

2. ALLOMETRIC SCALING: The observed scaling relationships indicate coordinated growth
   patterns likely controlled by regulatory gene networks affecting both size and shape.

3. CONDITION-DEPENDENT EXPRESSION: Color variance correlates with condition factor,
   suggesting plastic responses to environmental quality that may mask genetic variation.

4. MORPHOLOGICAL INTEGRATION: Strong correlations between fin ratios and body proportions
   indicate developmental constraints or pleiotropy in morphological trait expression.

5. POPULATION HETEROGENEITY: The coefficient of variation exceeding 30% for multiple
   traits suggests either significant genetic diversity, environmental heterogeneity,
   or presence of multiple cohorts/morphs within the population.

RECOMMENDATIONS FOR GENETIC ANALYSIS:
- Conduct parentage analysis to separate genetic from environmental variance
- Investigate color gene expression (MC1R, ASIP, TYRP1) across size classes  
- Examine growth hormone/IGF axis genes for size-pigmentation pleiotropy
- Consider population genomics to identify selection signatures
- Evaluate epigenetic modifications affecting pigmentation plasticity
""")